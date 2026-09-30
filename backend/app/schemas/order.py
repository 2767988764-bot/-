"""订单模块的 Pydantic 模式（app/routes/order.py 使用）"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

# 状态枚举（对齐 4.1）
PAY_STATUS_OPTIONS = ["已付款", "未付款"]
SHIP_STATUS_OPTIONS = ["已发货", "未发货"]


class OrderCreate(BaseModel):
    """新增订单：商品/客户/单价/数量/支付状态；订单编号与发货状态由后端生成"""
    productName: str = Field(..., max_length=100, description="商品名称")
    customer: str = Field(..., max_length=100, description="客户名称")
    price: float = Field(..., gt=0, description="单价")
    quantity: int = Field(..., gt=0, description="数量")
    payStatus: str = Field(default="未付款", description="支付状态：已付款/未付款")


class OrderUpdate(BaseModel):
    """修改订单：不含编号与发货状态；字段可选，仅更新传入项"""
    productName: Optional[str] = Field(None, max_length=100)
    customer: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, gt=0)
    payStatus: Optional[str] = Field(None)


class PayStatusUpdate(BaseModel):
    """改支付状态"""
    payStatus: str = Field(..., description="已付款/未付款")


class ShipUpdate(BaseModel):
    """发货：物流公司 + 运单号"""
    logistics: str = Field(..., max_length=60, description="物流公司")
    trackingNo: str = Field(..., max_length=60, description="运单号")


class OrderOut(BaseModel):
    """订单出参（敏感列已排除）。驼峰字段与前端提交流一致。"""
    id: int
    orderNo: str
    productName: str
    customer: str
    price: float
    quantity: int
    payStatus: str
    shipStatus: str
    logistics: Optional[str] = None
    trackingNo: Optional[str] = None
    createTime: datetime

    model_config = {"from_attributes": True}


def order_to_dict(o) -> dict:
    """把 Order 模型转为 camelCase 字典（供响应使用）"""
    return {
        "id": o.id,
        "orderNo": o.order_no,
        "productName": o.product_name,
        "customer": o.customer,
        "price": float(o.price),
        "quantity": o.quantity,
        "payStatus": o.pay_status,
        "shipStatus": o.ship_status,
        "logistics": o.logistics,
        "trackingNo": o.tracking_no,
        "createTime": o.created_at.isoformat() if o.created_at else None,
    }