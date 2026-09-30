"""认证接口：注册 + 登录

路由由 main.py 统一挂载到 /auth 前缀：
    POST /auth/register  -> 注册
    POST /auth/login     -> 登录拿 token
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core import login_lock
from app.core.deps import get_current_user, get_db, require_roles
from app.core.response import ok
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=UserOut, summary="用户注册")
def register(body: UserCreate, db: Session = Depends(get_db)):
    """注册新用户：用户名查重 -> bcrypt 哈希密码 -> 落库 -> 返回用户信息（不含密码）"""
    # 1. 查重：用户名必须唯一
    exists = db.query(User).filter(User.username == body.username).first()
    if exists:
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 2. 哈希密码（加盐），绝不存明文
    password_hash = hash_password(body.password)

    # 3. 落库
    user = User(username=body.username, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)  # 刷新，拿到数据库生成的 id / created_at
    return user


@router.post("/login", summary="登录获取令牌")
def login(body: UserLogin, db: Session = Depends(get_db)):
    """登录校验：先查锁定 -> 查用户 -> 验密码 -> 签发 JWT。

    任一失败统一返回 401（不泄露具体是哪项错）；
    连续失败 5 次后锁定 15 分钟，锁定期间一律返回 429。
    """
    # 0. 锁定判断：即使密码正确，锁定期间也拒绝
    if login_lock.is_locked(body.username):
        raise HTTPException(status_code=429, detail="尝试次数过多，请稍后再试")

    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        # 密码错误：计数 +1，若达到阈值则触发锁定
        if login_lock.register_failure(body.username):
            raise HTTPException(status_code=429, detail="尝试次数过多，账号已被临时锁定，请15分钟后再试")
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 登录成功：重置该用户名的失败计数与锁定状态
    login_lock.reset(body.username)

    # 签发 access token
    token = create_access_token(user.id, user.role)
    # 对齐后端对接说明.md 3.1：返回 { token, username, role }，且包成 { code, message, data }
    return ok({
        "token": token,
        "username": user.username,
        "role": user.role,
    })


@router.get("/me", response_model=UserOut, summary="获取当前登录用户信息（自信）")
def me(current_user: User = Depends(get_current_user)):
    """受保护示例接口：需携带有效 Bearer token 才能访问，返回当前用户信息（不含密码）"""
    return current_user


@router.get("/info", summary="获取当前登录用户信息（对齐文档 3.1 认证模块）")
def info(current_user: User = Depends(get_current_user)):
    """返回 { name, username, avatar, role, permissions }，供前端 store 拉取用户信息。

    - permissions：当前尚未实现完整权限位，先下发通配权限，保证前端 v-permission 不误伤按钮，待角色-权限模块就绪后替换为真实权限树。
    """
    return ok({
        "name": current_user.name or current_user.username,
        "username": current_user.username,
        "avatar": "",
        "role": current_user.role,
        "permissions": ["*:*:*"],
    })


@router.post("/logout", summary="退出登录")
def logout(current_user: User = Depends(get_current_user)):
    """登出。JWT 为无状态，前端删除本地 wms_token 即可；此接口按文档返回 true。"""
    return ok(True)


@router.get("/system/users", summary="（示例）仅管理员与总经理可访问")
def system_users(current_user: User = Depends(require_roles("系统管理员", "总经理"))):
    """角色权限示例接口：仅「系统管理员」「总经理」可访问，其它角色返回 403。"""
    return {"code": 200, "message": "当前用户有权限访问", "role": current_user.role}