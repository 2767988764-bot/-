"""FastAPI 公共依赖：数据库会话 + 当前登录用户鉴权"""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.user import User

# HTTPBearer(auto_error=False)：请求头缺失时不自动抛错，交给我们统一返回 401
bearer_scheme = HTTPBearer(auto_error=False)


def get_db():
    """FastAPI 依赖：每个请求一个数据库会话，用完即关"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """从 Authorization: Bearer <token> 解析并校验当前登录用户。

    任一环节失败（缺 token / 无效 / 过期 / 用户不存在）统一返回 401。
    成功后返回 User 对象，供业务接口直接使用。
    """
    # 1. 缺失 / 格式不对 -> 401
    if credentials is None or credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(status_code=401, detail="未提供有效的访问令牌")

    # 2. 解码校验（无效 / 过期 -> None）-> 401
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="令牌无效或已过期")

    # 3. 从 payload 取 user_id（sub 存的是字符串）
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="令牌载荷无效")

    # 4. 查库；查不到（用户被删除）-> 401
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")

    return user


def require_roles(*allowed_roles: str):
    """依赖工厂：限制某个接口只能被指定角色的用户访问。

    用法：def x(current_user: User = Depends(require_roles("系统管理员", "总经理"))):
    内部先走 get_current_user 鉴权，再检查角色，不在允许列表则返回 403。
    """
    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="权限不足，需要角色：" + " / ".join(allowed_roles),
            )
        return current_user

    return _checker