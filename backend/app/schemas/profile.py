"""个人中心接口的 Pydantic 模式（app/routes/profile.py 使用）"""
from typing import Optional

from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    """修改个人资料：姓名 / 手机号 / 邮箱（不含密码；字段可选，仅更新传入项）"""
    name: Optional[str] = Field(None, max_length=50, description="姓名")
    phone: Optional[str] = Field(None, max_length=20, description="手机号")
    email: Optional[str] = Field(None, max_length=100, description="邮箱")


class PasswordChange(BaseModel):
    """修改密码请求体"""
    oldPassword: str = Field(..., description="原密码（用于校验身份）")
    newPassword: str = Field(..., min_length=6, max_length=64, description="新密码")