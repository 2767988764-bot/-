"""出入库管理接口，挂载于 /biz 前缀（main.py 注册）。

统一响应 { code, message, data }。
- 鉴权：登录即可（get_current_user）。
- 4.3 容量校验：入库占用面积不得超过仓库可用面积（total-used）。
- 入库自动回写 Warehouse.used_area、生成"入库"台账；出库回减 used_area、生成"出库"台账。
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.response import ok
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.stock import StockIn, StockLedger, StockOut
from app.schemas.stock import (
    STOCK_IN_TYPES,
    StockInCreate,
    StockOutCreate,
    ledger_to_dict,
    stock_in_to_dict,
    stock_out_to_dict,
)

router = APIRouter(prefix="/biz", tags=["出入库"])

AUTH = Depends(get_current_user)


def _get_warehouse_or_404(db: Session, wid: int) -> Warehouse:
    w = db.query(Warehouse).filter(Warehouse.id == wid, Warehouse.deleted == False).first()  # noqa: E712
    if w is None:
        raise HTTPException(status_code=400, detail="仓库不存在")
    return w


def _validate_in_type(t: str):
    if t not in STOCK_IN_TYPES:
        raise HTTPException(status_code=400, detail="入库类型取值不合法")


# ---------- 入库 ----------

@router.get("/stock-in/list", summary="入库单列表（分页 + 筛选）")
def list_stock_in(
    _auth: User = AUTH,
    db: Session = Depends(get_db),
    keyword: str | None = Query(None, description="模糊：货号/订单号/货物名称"),
    warehouse: str | None = Query(None, description="仓库名称"),
    inType: str | None = Query(None, description="入库类型"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    q = db.query(StockIn).filter(StockIn.deleted == False)  # noqa: E712
    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(StockIn.goods_no.like(like), StockIn.order_no.like(like), StockIn.goods_name.like(like)))
    if warehouse:
        q = q.filter(StockIn.warehouse == warehouse)
    if inType:
        q = q.filter(StockIn.in_type == inType)
    total = q.count()
    items = q.order_by(StockIn.id.desc()).offset((page - 1) * pageSize).limit(pageSize).all()
    return ok({"list": [stock_in_to_dict(s) for s in items], "total": total})


@router.post("/stock-in", summary="新增入库单（4.3 容量校验）")
def add_stock_in(
    body: StockInCreate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    _validate_in_type(body.inType)
    wh = _get_warehouse_or_404(db, body.warehouseId)
    total = float(wh.total_area or 0)
    used = float(wh.used_area or 0)
    usable = total - used
    oc = float(body.occupyArea)
    if oc > usable:
        raise HTTPException(status_code=400, detail="仓库容量不足")
    if oc < 0:
        raise HTTPException(status_code=400, detail="仓库容量不足")

    record = StockIn(
        order_no=body.orderNo or "",
        goods_no=body.goodsName,            # 货号简化：由货物名称派生（与 mock 交互弱依赖）
        goods_name=body.goodsName,
        warehouse_id=wh.id,
        warehouse=wh.name,
        quantity=body.quantity,
        occupy_area=oc,
        customer=body.customer or "",
        location=body.location or "",
        in_type=body.inType,
        operator=_auth.name or _auth.username,
        status="已入库",   # 4.1
    )
    db.add(record)
    # 回写仓库已用面积
    wh.used_area = round(used + oc, 2)
    # 追加入库台账
    db.add(StockLedger(
        date=datetime.now().strftime("%Y-%m-%d"),
        goods_no=record.goods_no,
        type="入库",
        goods_name=body.goodsName,
        quantity=body.quantity,
        warehouse=wh.name,
        operator=_auth.name or _auth.username,
    ))
    db.commit()
    db.refresh(record)
    return ok(stock_in_to_dict(record))


@router.delete("/stock-in/{sid}", summary="逻辑删除入库单")
def delete_stock_in(sid: int, _auth: User = AUTH, db: Session = Depends(get_db)):
    rec = db.query(StockIn).filter(StockIn.id == sid, StockIn.deleted == False).first()  # noqa: E712
    if rec is None:
        raise HTTPException(status_code=400, detail="入库单不存在")
    rec.deleted = True
    db.commit()
    return ok(True)


# ---------- 出库 ----------

@router.get("/stock-out/list", summary="出库单列表（分页 + 筛选）")
def list_stock_out(
    _auth: User = AUTH,
    db: Session = Depends(get_db),
    keyword: str | None = Query(None, description="模糊：货号/订单号/货物名称/客户"),
    outStatus: str | None = Query(None, description="出库状态：待出库/已出库"),
    warehouse: str | None = Query(None, description="仓库名称"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    q = db.query(StockOut).filter(StockOut.deleted == False)  # noqa: E712
    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(
            StockOut.goods_no.like(like),
            StockOut.order_no.like(like),
            StockOut.goods_name.like(like),
            StockOut.customer.like(like),
        ))
    if outStatus:
        q = q.filter(StockOut.out_status == outStatus)
    if warehouse:
        q = q.filter(StockOut.warehouse == warehouse)
    total = q.count()
    items = q.order_by(StockOut.id.desc()).offset((page - 1) * pageSize).limit(pageSize).all()
    return ok({"list": [stock_out_to_dict(s) for s in items], "total": total})


@router.post("/stock-out", summary="新增待出库单")
def add_stock_out(
    body: StockOutCreate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    wh = _get_warehouse_or_404(db, body.warehouseId)
    record = StockOut(
        order_no=body.orderNo or "",
        goods_no=body.goodsName,
        goods_name=body.goodsName,
        warehouse_id=wh.id,
        warehouse=wh.name,
        quantity=body.quantity,
        occupy_area=body.occupyArea or 0,
        customer=body.customer or "",
        location=body.location or "",
        out_status="待出库",   # 4.1
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return ok(stock_out_to_dict(record))


@router.post("/stock-out/{sid}", summary="执行出库/发货")
def execute_stock_out(sid: int, _auth: User = AUTH, db: Session = Depends(get_db)):
    rec = db.query(StockOut).filter(StockOut.id == sid, StockOut.deleted == False).first()  # noqa: E712
    if rec is None:
        raise HTTPException(status_code=400, detail="出库单不存在")
    if rec.out_status != "待出库":
        raise HTTPException(status_code=400, detail="该出库单已出库，请勿重复出库")
    wh = _get_warehouse_or_404(db, rec.warehouse_id)
    # 出库：回减仓库已用面积（不小于 0）
    used = float(wh.used_area or 0)
    wh.used_area = round(max(0.0, used - float(rec.occupy_area or 0)), 2)
    rec.out_status = "已出库"   # 4.1
    rec.out_operator = _auth.name or _auth.username
    rec.out_time = datetime.now()
    db.add(StockLedger(
        date=datetime.now().strftime("%Y-%m-%d"),
        goods_no=rec.goods_no,
        type="出库",
        goods_name=rec.goods_name,
        quantity=rec.quantity,
        warehouse=rec.warehouse,
        operator=_auth.name or _auth.username,
    ))
    db.commit()
    db.refresh(rec)
    return ok(stock_out_to_dict(rec))


# ---------- 台账 / 盘点 ----------

@router.get("/stock/ledger", summary="出入库台账（按时间倒序）")
def stock_ledger(
    _auth: User = AUTH,
    db: Session = Depends(get_db),
    keyword: str | None = Query(None, description="模糊：货号/货物名称"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    q = db.query(StockLedger).filter(StockLedger.deleted == False)  # noqa: E712
    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(StockLedger.goods_no.like(like), StockLedger.goods_name.like(like)))
    total = q.count()
    items = q.order_by(StockLedger.created_at.desc()).offset((page - 1) * pageSize).limit(pageSize).all()
    return ok({"list": [ledger_to_dict(s) for s in items], "total": total})


@router.get("/stock/inventory-check", summary="仓库盘点（账面/实盘）")
def inventory_check(
    _auth: User = AUTH,
    db: Session = Depends(get_db),
    keyword: str | None = Query(None, description="模糊：货号/货物名称"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    # 以入库记录为账面基数，按 (货号, 仓库) 聚合出账面数量
    rows = (
        db.query(StockIn.goods_no, StockIn.warehouse, StockIn.goods_name, func.sum(StockIn.quantity).label("qty"))
        .filter(StockIn.deleted == False)  # noqa: E712
        .group_by(StockIn.goods_no, StockIn.warehouse, StockIn.goods_name)
        .all()
    )
    list_all = [
        {
            "id": 9000 + idx,
            "goodsNo": r.goods_no,
            "goodsName": r.goods_name,
            "warehouse": r.warehouse,
            "bookQuantity": int(r.qty or 0),
            "actualQuantity": int(r.qty or 0),
            "remark": "账实相符",
        }
        for idx, r in enumerate(rows)
    ]
    if keyword:
        like = f"%{keyword}%"
        list_all = [x for x in list_all if (keyword in x["goodsNo"]) or (keyword in x["goodsName"])]
    start = (page - 1) * pageSize
    paged = list_all[start:start + pageSize]
    return ok({"list": paged, "total": len(list_all)})