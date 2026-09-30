"""仓库模块的 Pydantic 模式（app/routes/warehouse.py 使用）"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

# 仓库类型枚举（对齐 src/mock/warehouse.js 的 WAREHOUSE_TYPES）
WAREHOUSE_TYPES = ["普通仓库", "待检库", "废品库"]


class WarehouseCreate(BaseModel):
    """新增仓库"""
    code: str = Field(..., max_length=20, description="仓库编码")
    name: str = Field(..., max_length=100, description="仓库名称")
    type: str = Field(..., max_length=20, description="仓库类型")
    totalArea: Optional[float] = Field(0, ge=0, description="总面积")
    usedArea: Optional[float] = Field(0, ge=0, description="已用面积")
    address: Optional[str] = Field(None, max_length=200, description="地址")
    manager: Optional[str] = Field(None, max_length=60, description="负责人")
    phone: Optional[str] = Field(None, max_length=20, description="电话")


class WarehouseUpdate(BaseModel):
    """修改仓库：字段可选，仅更新传入项"""
    code: Optional[str] = Field(None, max_length=20)
    name: Optional[str] = Field(None, max_length=100)
    type: Optional[str] = Field(None, max_length=20)
    totalArea: Optional[float] = Field(None, ge=0)
    usedArea: Optional[float] = Field(None, ge=0)
    address: Optional[str] = Field(None, max_length=200)
    manager: Optional[str] = Field(None, max_length=60)
    phone: Optional[str] = Field(None, max_length=20)


class StatusUpdate(BaseModel):
    """启用/停用仓库：status 必填，仅允许 0/1"""
    status: int = Field(..., description="1 启用 / 0 停用")


class UsedAreaUpdate(BaseModel):
    """回写已用面积：delta 为占用增减量（入库为正，出库为负）"""
    delta: float = Field(..., description="占用面积变化量")


class WarehouseOut(BaseModel):
    """仓库出参（驼峰字段与前端提交流一致）"""
    id: int
    code: str
    name: str
    type: str
    totalArea: float
    usedArea: float
    address: Optional[str] = None
    manager: Optional[str] = None
    phone: Optional[str] = None
    status: int
    createTime: datetime

    model_config = {"from_attributes": True}


def warehouse_to_dict(w) -> dict:
    """把 Warehouse 模型转为 camelCase 字典（供响应使用）"""
    return {
        "id": w.id,
        "code": w.code,
        "name": w.name,
        "type": w.type,
        "totalArea": round(float(w.total_area or 0), 2),
        "usedArea": round(float(w.used_area or 0), 2),
        "address": w.address,
        "manager": w.manager,
        "phone": w.phone,
        "status": w.status,
        "createTime": w.created_at.isoformat() if w.created_at else None,
    }


def warehouse_option_dict(w) -> dict:
    """下拉选项：{id, code, name, usableArea}（usableArea = totalArea - usedArea，保留2位）"""
    usable = round(max(float(w.total_area or 0) - float(w.used_area or 0), 0), 2)
    return {
        "id": w.id,
        "code": w.code,
        "name": w.name,
        "usableArea": usable,
    }