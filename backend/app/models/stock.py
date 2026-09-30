"""入库记录表（出入库模块）"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class StockIn(Base):
    """入库记录：登记货号/名称/数量/占用面积/仓库/库位"""

    __tablename__ = "stock_in_records"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    order_no: Mapped[str | None] = mapped_column(String(32), nullable=True)        # 关联订单号
    goods_no: Mapped[str] = mapped_column(String(40), nullable=False)              # 货号
    goods_name: Mapped[str] = mapped_column(String(100), nullable=False)           # 货物名称
    warehouse_id: Mapped[int] = mapped_column(BigInteger, nullable=False)          # 关联 Warehouse.id
    warehouse: Mapped[str] = mapped_column(String(100), nullable=False)            # 仓库名称
    quantity: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)   # 数量
    occupy_area: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)  # 占用面积
    customer: Mapped[str | None] = mapped_column(String(100), nullable=True)       # 客户
    location: Mapped[str | None] = mapped_column(String(60), nullable=True)        # 库位
    in_type: Mapped[str] = mapped_column(String(20), nullable=False)               # 入库类型：生产/采购/退货/调拨
    operator: Mapped[str] = mapped_column(String(60), nullable=False, default="")  # 操作员
    in_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())  # 入库时间
    status: Mapped[str] = mapped_column(String(10), nullable=False, default="已入库")  # 已入库

    # 逻辑删除标记：deleted=True 不参与任何查询
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class StockOut(Base):
    """出库记录：由入库登记后续处理，待出库/已出库"""

    __tablename__ = "stock_out_records"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    order_no: Mapped[str | None] = mapped_column(String(32), nullable=True)        # 关联订单号
    goods_no: Mapped[str] = mapped_column(String(40), nullable=False)              # 货号
    goods_name: Mapped[str] = mapped_column(String(100), nullable=False)           # 货物名称
    warehouse_id: Mapped[int] = mapped_column(BigInteger, nullable=False)          # 关联 Warehouse.id
    warehouse: Mapped[str] = mapped_column(String(100), nullable=False)            # 仓库名称
    quantity: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)   # 数量
    occupy_area: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)  # 占用面积
    customer: Mapped[str | None] = mapped_column(String(100), nullable=True)       # 客户
    location: Mapped[str | None] = mapped_column(String(60), nullable=True)        # 库位
    out_operator: Mapped[str | None] = mapped_column(String(60), nullable=True)    # 出库操作员
    out_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)  # 出库时间
    out_status: Mapped[str] = mapped_column(String(10), nullable=False, default="待出库")  # 待出库/已出库

    # 逻辑删除标记：deleted=True 不参与任何查询
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class StockLedger(Base):
    """出入库台账：入库/出库流水（按时间倒序）"""

    __tablename__ = "stock_ledger"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    date: Mapped[str] = mapped_column(String(10), nullable=False)          # 日期 yyyy-mm-dd
    goods_no: Mapped[str] = mapped_column(String(40), nullable=False)      # 货号
    type: Mapped[str] = mapped_column(String(10), nullable=False)          # 入库/出库
    goods_name: Mapped[str] = mapped_column(String(100), nullable=False)   # 货物名称
    quantity: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)  # 数量
    warehouse: Mapped[str] = mapped_column(String(100), nullable=False)    # 仓库名称
    operator: Mapped[str | None] = mapped_column(String(60), nullable=True)  # 操作员

    # 逻辑删除标记：deleted=True 不参与任何查询
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )