"""出入库模块的 Pydantic 模式（app/routes/stock.py 使用）"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

# 入库类型枚举（对齐 src/mock/stock.js 的 STOCK_IN_TYPES）
STOCK_IN_TYPES = ["生产入库", "采购入库", "退货入库", "调拨入库"]
# 存储位置枚举（对齐 src/mock/stock.js 的 STORAGE_LOCATIONS）
STORAGE_LOCATIONS = ["A-01 货架", "A-02 货架", "B-01 货架", "B-02 货架", "C-01 货区", "C-02 货区"]
# 出入库台账类型
LEDGER_TYPES = ["入库", "出库"]
# 出库状态（4.1）
STOCK_OUT_STATUS = ["已出库", "待出库"]


class StockInCreate(BaseModel):
    """新增入库单（发货入库后容量校验见 4.3）"""
    orderNo: Optional[str] = Field(None, max_length=32)
    goodsName: str = Field(..., max_length=100, description="货物名称")
    warehouseId: int = Field(..., description="仓库 id（用于容量校验）")
    warehouse: str = Field(..., max_length=100, description="仓库名称")
    quantity: int = Field(1, ge=0, description="数量")
    occupyArea: float = Field(..., gt=0, description="占用面积")
    customer: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=60)
    inType: str = Field(..., max_length=20, description="入库类型")


class StockOutCreate(BaseModel):
    """新增待出库单"""
    orderNo: Optional[str] = Field(None, max_length=32)
    goodsName: str = Field(..., max_length=100)
    warehouseId: int = Field(..., description="仓库 id")
    warehouse: str = Field(..., max_length=100)
    quantity: int = Field(1, ge=0)
    occupyArea: float = Field(0, ge=0)
    customer: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=60)


class StockLedgerOut(BaseModel):
    """出参（camelCase 与前端一致）"""
    id: int
    date: str
    goodsNo: str
    type: str
    goodsName: str
    quantity: int
    warehouse: str
    operator: Optional[str] = None
    createTime: datetime

    model_config = {"from_attributes": True}


def stock_in_to_dict(s) -> dict:
    """把 StockIn 转为 camelCase 字典（含 createTime）"""
    return {
        "id": s.id,
        "orderNo": s.order_no,
        "goodsNo": s.goods_no,
        "goodsName": s.goods_name,
        "warehouseId": s.warehouse_id,
        "warehouse": s.warehouse,
        "quantity": s.quantity,
        "occupyArea": round(float(s.occupy_area or 0), 2),
        "customer": s.customer,
        "location": s.location,
        "inType": s.in_type,
        "operator": s.operator,
        "inTime": s.in_time.strftime("%Y-%m-%d %H:%M:%S") if s.in_time else None,
        "status": s.status,
        "createTime": s.created_at.isoformat() if s.created_at else None,
    }


def stock_out_to_dict(s) -> dict:
    """把 StockOut 转为 camelCase 字典"""
    return {
        "id": s.id,
        "orderNo": s.order_no,
        "goodsNo": s.goods_no,
        "goodsName": s.goods_name,
        "warehouseId": s.warehouse_id,
        "warehouse": s.warehouse,
        "quantity": s.quantity,
        "occupyArea": round(float(s.occupy_area or 0), 2),
        "customer": s.customer,
        "location": s.location,
        "outOperator": s.out_operator,
        "outTime": s.out_time.strftime("%Y-%m-%d %H:%M:%S") if s.out_time else "",
        "outStatus": s.out_status,
        "createTime": s.created_at.isoformat() if s.created_at else None,
    }


def ledger_to_dict(s) -> dict:
    """把 StockLedger 转为 camelCase 字典"""
    return {
        "id": s.id,
        "date": s.date,
        "goodsNo": s.goods_no,
        "type": s.type,
        "goodsName": s.goods_name,
        "quantity": s.quantity,
        "warehouse": s.warehouse,
        "operator": s.operator,
        "createTime": s.created_at.isoformat() if s.created_at else None,
    }