"""订单管理接口，挂载于 /biz 前缀（main.py 注册），对齐 后端对接说明.md 3.5。

统一响应 { code, message, data }。
- 查询/写操作的鉴权：登录即可（get_current_user）。按需可换 require_roles。
- 订单编号后端生成（4.2）：N + yyyyMMdd + 3位序号。
- 删除为逻辑删除（4.6）：deleted=True 后所有查询自动过滤。
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.response import ok
from app.models.order import Order
from app.models.user import User
from app.schemas.order import (
    PAY_STATUS_OPTIONS,
    SHIP_STATUS_OPTIONS,
    OrderCreate,
    OrderUpdate,
    PayStatusUpdate,
    ShipUpdate,
    order_to_dict,
)

router = APIRouter(prefix="/biz", tags=["订单管理"])

AUTH = Depends(get_current_user)


def _next_order_no(db: Session) -> str:
    """生成订单编号：N + yyyyMMdd + 3位序号（按当天已有订单数递增）"""
    day = datetime.now().strftime("%Y%m%d")
    prefix = f"N{day}"
    count = db.query(func.count(Order.id)).filter(Order.order_no.like(f"{prefix}%")).scalar() or 0
    return f"{prefix}{count + 1:03d}"


def _get_or_404(db: Session, oid: int) -> Order:
    o = db.query(Order).filter(Order.id == oid, Order.deleted == False).first()  # noqa: E712
    if o is None:
        raise HTTPException(status_code=400, detail="订单不存在")
    return o


@router.get("/order/list", summary="订单列表（分页 + 筛选）")
def list_orders(
    _auth: User = AUTH,
    db: Session = Depends(get_db),
    keyword: str | None = Query(None, description="模糊：商品名称 / 客户 / 订单编号"),
    payStatus: str | None = Query(None, description="支付状态：已付款/未付款"),
    shipStatus: str | None = Query(None, description="发货状态：已发货/未发货"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    q = db.query(Order).filter(Order.deleted == False)  # noqa: E712

    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(Order.product_name.like(like), Order.customer.like(like), Order.order_no.like(like)))
    if payStatus:
        q = q.filter(Order.pay_status == payStatus)
    if shipStatus:
        q = q.filter(Order.ship_status == shipStatus)

    total = q.count()
    items = q.order_by(Order.id.desc()).offset((page - 1) * pageSize).limit(pageSize).all()
    return ok({"list": [order_to_dict(o) for o in items], "total": total})


@router.post("/order", summary="新增订单")
def add_order(
    body: OrderCreate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    if body.payStatus not in PAY_STATUS_OPTIONS:
        raise HTTPException(status_code=400, detail="支付状态取值不合法")

    o = Order(
        order_no=_next_order_no(db),   # 编号后端自动生成
        product_name=body.productName,
        customer=body.customer,
        price=body.price,
        quantity=body.quantity,
        pay_status=body.payStatus,
        ship_status="未发货",          # 初始未发货
    )
    db.add(o)
    db.commit()
    db.refresh(o)
    return ok(order_to_dict(o))


@router.put("/order/{order_id}", summary="修改订单")
def update_order(
    order_id: int,
    body: OrderUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    order = _get_or_404(db, order_id)
    data = body.model_dump(exclude_unset=True)
    if "payStatus" in data and data["payStatus"] not in PAY_STATUS_OPTIONS:
        raise HTTPException(status_code=400, detail="支付状态取值不合法")

    mapping = {
        "productName": "product_name",
        "customer": "customer",
        "price": "price",
        "quantity": "quantity",
        "payStatus": "pay_status",
    }
    for k, v in data.items():
        if k in mapping:
            setattr(order, mapping[k], v)
    db.commit()
    db.refresh(order)
    return ok(order_to_dict(order))


@router.delete("/order/{order_id}", summary="逻辑删除订单")
def delete_order(order_id: int, _auth: User = AUTH, db: Session = Depends(get_db)):
    order = _get_or_404(db, order_id)
    order.deleted = True   # 逻辑删除，保留记录
    db.commit()
    return ok(True)


@router.patch("/order/{order_id}/pay", summary="修改支付状态")
def update_pay_status(
    order_id: int,
    body: PayStatusUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    if body.payStatus not in PAY_STATUS_OPTIONS:
        raise HTTPException(status_code=400, detail="支付状态取值不合法")
    order = _get_or_404(db, order_id)
    order.pay_status = body.payStatus
    db.commit()
    return ok(True)


@router.post("/order/{order_id}/ship", summary="发货")
def ship_order(
    order_id: int,
    body: ShipUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    order = _get_or_404(db, order_id)
    order.logistics = body.logistics
    order.tracking_no = body.trackingNo
    order.ship_status = "已发货"   # 发货成功后状态变更
    db.commit()
    db.refresh(order)
    return ok(order_to_dict(order))