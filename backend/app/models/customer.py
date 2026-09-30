"""客户表（客户管理模块）"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Customer(Base):
    """客户表：客户名称/联系人/电话/地址/备注/状态"""

    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)       # 客户名称
    contact: Mapped[str] = mapped_column(String(60), nullable=False)     # 联系人
    phone: Mapped[str] = mapped_column(String(20), nullable=False)       # 电话
    address: Mapped[str | None] = mapped_column(String(200), nullable=True)  # 地址
    remark: Mapped[str | None] = mapped_column(String(255), nullable=True)   # 备注

    # 状态枚举：正常 / 黑名单
    status: Mapped[str] = mapped_column(String(10), nullable=False, default="正常")

    # 逻辑删除标记：deleted=True 不参与任何查询
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )