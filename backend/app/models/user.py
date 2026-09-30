"""用户表模型（SQLAlchemy）

角色固定四选一：系统管理员 / 总经理 / 仓库管理员 / 车间生产员
（具体取值校验放在接口层 Pydantic schema 做，本层只负责存储结构）
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, BigInteger, Integer, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    """用户表：登录账号 + 角色（对应设计稿中的四种角色）"""

    # 表名用 users：user 在 PostgreSQL 里是保留字，避开
    __tablename__ = "users"

    # 主键自增
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    # 用户名：唯一、必填，建索引加速登录查询
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)

    # 密码哈希：只存 bcrypt 哈希结果（60 字符），绝不存明文
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)

    # 角色：必填，默认「仓库管理员」
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="仓库管理员")

    # 用户管理扩展字段（对接前端用户管理页）
    name: Mapped[str] = mapped_column(String(50), nullable=False, default="")   # 姓名/显示名
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)         # 手机号
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)        # 邮箱
    status: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)  # 1 启用 / 0 停用

    # 逻辑删除标记：deleted=False 正常，True 已删除（保留记录）
    deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # 创建时间：由数据库端 now() 生成，应用侧不用传
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
