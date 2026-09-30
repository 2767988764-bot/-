"""仓库管理接口，挂载于 /biz 前缀（main.py 注册）。

统一响应 { code, message, data }。
- 鉴权：登录即可（get_current_user）。
- 删除为逻辑删除：deleted=True 后所有查询自动过滤。
- status 为整型：1 启用 / 0 停用（4.1 约定）。
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.response import ok
from app.models.user import User
from app.models.warehouse import Warehouse
from app.schemas.warehouse import (
    WAREHOUSE_TYPES,
    StatusUpdate,
    UsedAreaUpdate,
    WarehouseCreate,
    WarehouseUpdate,
    warehouse_option_dict,
    warehouse_to_dict,
)

router = APIRouter(prefix="/biz", tags=["仓库管理"])

AUTH = Depends(get_current_user)


def _get_or_404(db: Session, wid: int) -> Warehouse:
    w = db.query(Warehouse).filter(Warehouse.id == wid, Warehouse.deleted == False).first()  # noqa: E712
    if w is None:
        raise HTTPException(status_code=400, detail="仓库不存在")
    return w


def _validate_type(t: str):
    if t not in WAREHOUSE_TYPES:
        raise HTTPException(status_code=400, detail="仓库类型取值不合法")


@router.get("/warehouse/list", summary="仓库列表（分页 + 筛选）")
def list_warehouses(
    _auth: User = AUTH,
    db: Session = Depends(get_db),
    keyword: str | None = Query(None, description="模糊：编码 / 名称 / 地址"),
    type: str | None = Query(None, description="仓库类型"),
    status: int | None = Query(None, description="状态：1 启用 / 0 停用"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    q = db.query(Warehouse).filter(Warehouse.deleted == False)  # noqa: E712

    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(Warehouse.code.like(like), Warehouse.name.like(like), Warehouse.address.like(like)))
    if type:
        q = q.filter(Warehouse.type == type)
    if status is not None:
        q = q.filter(Warehouse.status == status)

    total = q.count()
    items = q.order_by(Warehouse.id.desc()).offset((page - 1) * pageSize).limit(pageSize).all()
    return ok({"list": [warehouse_to_dict(w) for w in items], "total": total})


@router.get("/warehouse/all", summary="全部启用中仓库（卡片/出库入库下拉）")
def all_warehouses(_auth: User = AUTH, db: Session = Depends(get_db)):
    items = db.query(Warehouse).filter(Warehouse.deleted == False, Warehouse.status == 1).order_by(Warehouse.id.asc()).all()  # noqa: E712
    return ok([warehouse_to_dict(w) for w in items])


@router.get("/warehouse/options", summary="仓库下拉选项（未删除全部）")
def warehouse_options(_auth: User = AUTH, db: Session = Depends(get_db)):
    items = db.query(Warehouse).filter(Warehouse.deleted == False).order_by(Warehouse.id.asc()).all()  # noqa: E712
    return ok([warehouse_option_dict(w) for w in items])


@router.get("/warehouse/summary", summary="仓库容量汇总（仪表盘柱状图）")
def warehouse_summary(_auth: User = AUTH, db: Session = Depends(get_db)):
    row = (
        db.query(
            func.count(Warehouse.id).label("code"),
            func.coalesce(func.sum(Warehouse.used_area), 0).label("used"),
            func.coalesce(func.sum(Warehouse.total_area), 0).label("total"),
        )
        .filter(Warehouse.deleted == False)  # noqa: E712
        .first()
    )
    return ok({
        "code": row.code if row else 0,
        "usedArea": round(float(row.used if row else 0), 2),
        "totalArea": round(float(row.total if row else 0), 2),
    })


@router.post("/warehouse", summary="新增仓库")
def add_warehouse(
    body: WarehouseCreate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    _validate_type(body.type)
    w = Warehouse(
        code=body.code,
        name=body.name,
        type=body.type,
        total_area=body.totalArea or 0,
        used_area=body.usedArea or 0,
        address=body.address,
        manager=body.manager,
        phone=body.phone,
        status=1,   # 新仓库默认启用
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return ok(warehouse_to_dict(w))


@router.put("/warehouse/{wid}", summary="修改仓库")
def update_warehouse(
    wid: int,
    body: WarehouseUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    warehouse = _get_or_404(db, wid)
    data = body.model_dump(exclude_unset=True)
    if "type" in data:
        _validate_type(data["type"])
    mapping = {
        "code": "code",
        "name": "name",
        "type": "type",
        "totalArea": "total_area",
        "usedArea": "used_area",
        "address": "address",
        "manager": "manager",
        "phone": "phone",
    }
    for k, v in data.items():
        if k in mapping:
            setattr(warehouse, mapping[k], v)
    db.commit()
    db.refresh(warehouse)
    return ok(warehouse_to_dict(warehouse))


@router.delete("/warehouse/{wid}", summary="逻辑删除仓库")
def delete_warehouse(wid: int, _auth: User = AUTH, db: Session = Depends(get_db)):
    warehouse = _get_or_404(db, wid)
    warehouse.deleted = True   # 逻辑删除，保留记录
    db.commit()
    return ok(True)


@router.patch("/warehouse/{wid}/status", summary="启用/停用仓库")
def toggle_warehouse_status(
    wid: int,
    body: StatusUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    if body.status not in (0, 1):
        raise HTTPException(status_code=400, detail="仓库状态只能为 1（启用）或 0（停用）")
    warehouse = _get_or_404(db, wid)
    warehouse.status = body.status
    db.commit()
    return ok(True)


@router.patch("/warehouse/{wid}/area", summary="回写仓库已用面积")
def change_used_area(
    wid: int,
    body: UsedAreaUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    warehouse = _get_or_404(db, wid)
    new_val = float(warehouse.used_area or 0) + body.delta
    warehouse.used_area = round(max(0.0, min(new_val, float(warehouse.total_area or 0))), 2)
    db.commit()
    db.refresh(warehouse)
    return ok(warehouse_to_dict(warehouse))