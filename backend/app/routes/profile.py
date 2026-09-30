"""个人中心接口，挂载于 /system 前缀（main.py 注册），对齐 后端对接说明.md 3.13。

统一响应 { code, message, data }。
接口只需登录（get_current_user），不限角色。
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.response import ok
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.profile import PasswordChange, ProfileUpdate

router = APIRouter(prefix="/system", tags=["个人中心"])

AUTH = Depends(get_current_user)


def _profile_dict(u: User) -> dict:
    """出参：不含 password_hash；createTime 用 created_at"""
    return {
        "id": u.id,
        "username": u.username,
        "name": u.name,
        "phone": u.phone,
        "email": u.email,
        "avatar": "",                       # 头像暂空，待上传功能
        "createTime": u.created_at.isoformat() if u.created_at else None,
    }


@router.get("/profile", summary="获取当前登录人资料")
def get_profile(_auth: User = AUTH):
    return ok(_profile_dict(_auth))


@router.put("/profile", summary="修改个人资料（不含密码）")
def update_profile(
    body: ProfileUpdate,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == _auth.id).first()
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return ok(_profile_dict(user))


@router.put("/profile/password", summary="修改密码（需校验原密码）")
def change_password(
    body: PasswordChange,
    _auth: User = AUTH,
    db: Session = Depends(get_db),
):
    # 1. 校验原密码：错误则拒绝，绝不可仅凭新密码就改
    if not verify_password(body.oldPassword, _auth.password_hash):
        raise HTTPException(status_code=400, detail="原密码错误")

    # 2. 对新密码做 bcrypt 哈希后落库
    _auth.password_hash = hash_password(body.newPassword)
    db.commit()

    # 3. token 失效：改密成功后前端会强制登出并重新登录（文档 3.13 建议的简单方案）
    return ok({"success": True})