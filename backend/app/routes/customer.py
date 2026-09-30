"""客户管理接口，挂载于 /biz 前缀（main.py 注册）。

统一响应 { code, message, data }。
- 鉴权：登录即可（get_current_user）。
- 删除为逻辑删除：deleted=True 后所有查询自动过滤。
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.response import ok
from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import (
    CUSTOMER_STATUS_OPTIONS,
    BlacklistUpdate,
    CustomerCreate,
    CustomerUpdate,
    customer_to_dict,
)

router = APIRouter(prefix="/biz", tags=["客户管理"])

AUTH = Depends(get_current_user)


def _get_or_404(db: Session, cid: int) -> Customer:
    c = db.query(Customer).filter(Customer.id == cid, Customer.deleted == False).first()  # noqa: E712
    if c is None:
        raise HTTPException(status_code=400, detail="客户不存在")
    return c


@router.get("/customer/list", summary="客户列表（分页 + 筛选）")
def list_customers(
    _auth: User = AUTH,
    db: Session = Depends(get_db),
    keyword: str | None = Query(None, description="模糊：客户名称 / 联系人 / 电话"),
    status: str | None = Query(None, description="客户状态：正常/黑名单"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    q = db.query(Customer).filter(Customer.deleted == False)  # noqa: E712

    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(Customer.name.like(like), Customer.contact.like(like), Customer.phone.like(like)))
    if status:
        q = q.filter(Customer.status == status)

    total = q.count()
    items = q.order_by(Customer.id.desc()).offset((page - 1) * pageSize).limit(pageSize).all()
    return ok({"list": [customer_to_dict(c) for c in items], "total": total})


@router.post("/customer", summary="新增客户")
def add_customer(
    body: CustomerCreate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    c = Customer(
        name=body.name,
        contact=body.contact,
        phone=body.phone,
        address=body.address,
        remark=body.remark,
        status="正常",   # 新客户默认正常
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return ok(customer_to_dict(c))


@router.put("/customer/{cid}", summary="修改客户")
def update_customer(
    cid: int,
    body: CustomerUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    customer = _get_or_404(db, cid)
    data = body.model_dump(exclude_unset=True)
    mapping = {
        "name": "name",
        "contact": "contact",
        "phone": "phone",
        "address": "address",
        "remark": "remark",
    }
    for k, v in data.items():
        if k in mapping:
            setattr(customer, mapping[k], v)
    db.commit()
    db.refresh(customer)
    return ok(customer_to_dict(customer))


@router.delete("/customer/{cid}", summary="逻辑删除客户")
def delete_customer(cid: int, _auth: User = AUTH, db: Session = Depends(get_db)):
    customer = _get_or_404(db, cid)
    customer.deleted = True   # 逻辑删除，保留记录
    db.commit()
    return ok(True)


@router.patch("/customer/{cid}/blacklist", summary="加入/移出黑名单")
def toggle_blacklist(
    cid: int,
    body: BlacklistUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    if body.status not in CUSTOMER_STATUS_OPTIONS:
        raise HTTPException(status_code=400, detail="客户状态取值不合法")
    customer = _get_or_404(db, cid)
    customer.status = body.status
    db.commit()
    return ok(True)