"""认证相关 Pydantic 模型：请求体校验 + 响应结构"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ---------- 请求体 ----------
class UserCreate(BaseModel):
    """注册请求：新用户账号信息"""

    username: str = Field(..., min_length=2, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, max_length=128, description="明文密码")


class UserLogin(BaseModel):
    """登录请求"""

    username: str = Field(..., description="用户名")
    password: str = Field(..., description="明文密码")


# ---------- 响应 ----------
class Token(BaseModel):
    """登录成功返回体（对齐 后端对接说明.md 3.1：token / username / role）"""

    token: str
    username: str
    role: str


class UserOut(BaseModel):
    """用户信息返回体：绝不包含 password_hash"""

    model_config = ConfigDict(from_attributes=True)  # 支持直接从 ORM 对象序列化

    id: int
    username: str
    role: str
    created_at: datetime