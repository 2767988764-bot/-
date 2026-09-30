"""客户模块的 Pydantic 模式（app/routes/customer.py 使用）"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

# 状态枚举
CUSTOMER_STATUS_OPTIONS = ["正常", "黑名单"]


class CustomerCreate(BaseModel):
    """新增客户"""
    name: str = Field(..., max_length=100, description="客户名称")
    contact: str = Field(..., max_length=60, description="联系人")
    phone: str = Field(..., max_length=20, description="电话")
    address: Optional[str] = Field(None, max_length=200, description="地址")
    remark: Optional[str] = Field(None, max_length=255, description="备注")


class CustomerUpdate(BaseModel):
    """修改客户：字段可选，仅更新传入项"""
    name: Optional[str] = Field(None, max_length=100)
    contact: Optional[str] = Field(None, max_length=60)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=200)
    remark: Optional[str] = Field(None, max_length=255)


class BlacklistUpdate(BaseModel):
    """加入/移出黑名单：status 必填"""
    status: str = Field(..., description="正常/黑名单")


class CustomerOut(BaseModel):
    """客户出参（驼峰字段与前端提交流一致）"""
    id: int
    name: str
    contact: str
    phone: str
    address: Optional[str] = None
    remark: Optional[str] = None
    status: str
    createTime: datetime

    model_config = {"from_attributes": True}


def customer_to_dict(c) -> dict:
    """把 Customer 模型转为 camelCase 字典（供响应使用）"""
    return {
        "id": c.id,
        "name": c.name,
        "contact": c.contact,
        "phone": c.phone,
        "address": c.address,
        "remark": c.remark,
        "status": c.status,
        "createTime": c.created_at.isoformat() if c.created_at else None,
    }