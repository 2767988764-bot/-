"""用户管理接口，挂载于 /system 前缀（main.py 注册）。

统一响应 { code, message, data }。
- 成功：返回 ok(...)（HTTP 200，data 挂业务数据）
- 错误：raise HTTPException，由 main.py 的全局处理器转成 {code,message,data}
角色范围：系统管理员 / 总经理（require_roles），越权返回 403。
删除为逻辑删除（deleted=True），保留记录。
"""
from typing import Callable, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, require_roles
from app.core.response import ok
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import ROLE_OPTIONS, UserCreate, UserOut, UserRole, UserStatus, UserUpdate

router = APIRouter(prefix="/system", tags=["用户管理"])

# 该分组公共鉴权：需登录且角色为系统管理员 / 总经理
ADMIN = Depends(require_roles("系统管理员", "总经理"))


def _err(code: int, message: str) -> None:
    raise HTTPException(status_code=code, detail=message)


def _get_or_404(db: Session, user_id: int) -> User:
    """按 id 查未删除用户，找不到报错"""
    user = db.query(User).filter(User.id == user_id, User.deleted == False).first()  # noqa: E712
    if user is None:
        _err(400, "用户不存在")
    return user


@router.get("/user/list", summary="用户列表（分页 + 筛选）")
def list_users(
    _auth: User = ADMIN,
    db: Session = Depends(get_db),
    keyword: Optional[str] = Query(None, description="模糊搜索：姓名 / 用户名 / 手机号 / 邮箱"),
    role: Optional[str] = Query(None, description="角色筛选"),
    status: Optional[int] = Query(None, ge=0, le=1, description="状态筛选 1启用/0停用"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    query = db.query(User).filter(User.deleted == False)  # noqa: E712

    if keyword:
        like = f"%{keyword}%"
        query = query.filter(or_(User.name.like(like), User.username.like(like),
                                 User.phone.like(like), User.email.like(like)))
    if role:
        query = query.filter(User.role == role)
    if status is not None:
        query = query.filter(User.status == status)

    total = query.count()
    items = query.order_by(User.id.desc()).offset((page - 1) * pageSize).limit(pageSize).all()

    # list 用 UserOut 序列化：不返回 password_hash / deleted；mode="json" 让 datetime 序列化
    return ok({"list": [UserOut.model_validate(u).model_dump(mode="json") for u in items], "total": total})


@router.post("/user", summary="新增用户")
def add_user(
    body: UserCreate,
    _auth: User = ADMIN,
    db: Session = Depends(get_db),
):
    if body.role not in ROLE_OPTIONS:
        _err(400, "角色取值不合法")
    if db.query(User).filter(User.username == body.username).first():
        _err(400, "用户名已存在")

    user = User(
        name=body.name,
        username=body.username,
        phone=body.phone,
        email=body.email,
        role=body.role,
        status=body.status,
        password_hash=hash_password(body.password),  # 密码 bcrypt 加盐哈希后落库
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return ok(UserOut.model_validate(user).model_dump(mode="json"))


@router.put("/user/{user_id}", summary="修改用户（不含改密码）")
def update_user(
    user_id: int,
    body: UserUpdate,
    _auth: User = ADMIN,
    db: Session = Depends(get_db),
):
    user = _get_or_404(db, user_id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return ok(UserOut.model_validate(user).model_dump(mode="json"))


@router.delete("/user/{user_id}", summary="逻辑删除用户")
def delete_user(user_id: int, _auth: User = ADMIN, db: Session = Depends(get_db)):
    user = _get_or_404(db, user_id)
    user.deleted = True  # 逻辑删除：保留记录
    db.commit()
    return ok(True)


@router.patch("/user/{user_id}/status", summary="启用 / 停用")
def toggle_status(user_id: int, body: UserStatus, _auth: User = ADMIN, db: Session = Depends(get_db)):
    user = _get_or_404(db, user_id)
    user.status = body.status
    db.commit()
    return ok(True)


@router.put("/user/{user_id}/role", summary="分配角色")
def assign_role(user_id: int, body: UserRole, _auth: User = ADMIN, db: Session = Depends(get_db)):
    if body.role not in ROLE_OPTIONS:
        _err(400, "角色取值不合法")
    user = _get_or_404(db, user_id)
    user.role = body.role
    db.commit()
    return ok(True)


@router.get("/roles/options", summary="角色下拉可选值")
def role_options(_auth: User = ADMIN):
    return ok(ROLE_OPTIONS)