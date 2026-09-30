"""仓库表（仓库管理模块）"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Numeric, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Warehouse(Base):
    """仓库表：编码/名称/类型/面积/状态"""

    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    code: Mapped[str] = mapped_column(String(20), nullable=False)        # 仓库编码
    name: Mapped[str] = mapped_column(String(100), nullable=False)       # 仓库名称
    type: Mapped[str] = mapped_column(String(20), nullable=False)        # 仓库类型：普通仓库/待检库/废品库
    total_area: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)  # 总面积
    used_area: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)   # 已用面积

    address: Mapped[str | None] = mapped_column(String(200), nullable=True)  # 地址
    manager: Mapped[str | None] = mapped_column(String(60), nullable=True)   # 负责人
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)     # 电话

    # 状态（4.1 整型约定）：1 启用 / 0 停用
    status: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)

    # 逻辑删除标记：deleted=True 不参与任何查询
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )