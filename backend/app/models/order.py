"""订单表（对齐 后端对接说明.md 3.5 / 4.1 / 4.2 / 4.6）"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, BigInteger, Numeric, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Order(Base):
    """订单表：订单基本信息 + 支付/发货状态"""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # 订单编号：N + yyyyMMdd + 3位序号（后端生成，禁止前端填写）
    order_no: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)

    product_name: Mapped[str] = mapped_column(String(100), nullable=False)      # 商品名称
    customer: Mapped[str] = mapped_column(String(100), nullable=False)          # 客户名称
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)        # 单价
    quantity: Mapped[int] = mapped_column(SmallInteger, nullable=False)         # 数量

    # 状态枚举（严格按 4.1）：支付 已付款/未付款；发货 已发货/未发货
    pay_status: Mapped[str] = mapped_column(String(10), nullable=False, default="未付款")
    ship_status: Mapped[str] = mapped_column(String(10), nullable=False, default="未发货")

    # 发货信息（发货成功后才填写）
    logistics: Mapped[str | None] = mapped_column(String(60), nullable=True)     # 物流公司
    tracking_no: Mapped[str | None] = mapped_column(String(60), nullable=True)   # 运单号

    # 逻辑删除标记（4.6）：deleted=True 不参与任何查询
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )