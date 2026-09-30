"""用户管理接口的 Pydantic 模式（app/routes/user.py 使用）"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

# 前端固定的四种角色
ROLE_OPTIONS = ["系统管理员", "总经理", "仓库管理员", "车间生产员"]


class UserCreate(BaseModel):
    """新增用户：name 姓名、username 登录账号、role 角色、status 启用/停用、password 初始密码"""
    name: str = Field(..., max_length=50, description="姓名")
    username: str = Field(..., min_length=2, max_length=50, description="登录账号")
    phone: Optional[str] = Field(None, max_length=20, description="手机号")
    email: Optional[str] = Field(None, max_length=100, description="邮箱")
    role: str = Field(default="仓库管理员", description="角色：四选一")
    status: int = Field(default=1, ge=0, le=1, description="1 启用 / 0 停用")
    password: str = Field(..., min_length=6, max_length=64, description="初始密码")


class UserUpdate(BaseModel):
    """修改用户：不含改密码（改密码另设接口）。所有字段可选，仅更新传入项。"""
    name: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    status: Optional[int] = Field(None, ge=0, le=1)


class UserStatus(BaseModel):
    """启停用请求体"""
    status: int = Field(..., ge=0, le=1, description="1 启用 / 0 停用")


class UserRole(BaseModel):
    """分配角色请求体"""
    role: str = Field(..., description="角色：四选一")


class UserOut(BaseModel):
    """用户出参（不含 password_hash / deleted 敏感字段）"""
    id: int
    name: str
    username: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str
    status: int
    created_at: datetime

    model_config = {"from_attributes": True}