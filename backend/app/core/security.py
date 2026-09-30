"""安全工具：密码哈希（bcrypt）+ JWT 签发/校验（python-jose）

密钥与过期时间一律从环境变量 / .env 读取，严禁硬编码。
"""
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext

# 复用 database.py 的 .env 加载逻辑（backend/.env 绝对路径）
from app.core.database import _BASE_DIR

load_dotenv(os.path.join(_BASE_DIR, ".env"))

# ---------- 从环境变量读取 ----------
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("缺少 JWT 密钥：请在 backend/.env 里配置 SECRET_KEY（被 git 忽略）。")

# 过期时间（分钟），带默认值但走环境变量
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))


# ---------- 密码哈希（bcrypt） ----------
# passlib 的 CryptContext 封装 bcrypt，自动加盐；存进库里的 password_hash 已含盐
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """对明文密码做加盐 bcrypt 哈希，返回可直接入库的哈希串"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码是否与库中哈希匹配"""
    return pwd_context.verify(plain_password, hashed_password)


# ---------- JWT ----------
ALGORITHM = "HS256"


def create_access_token(user_id: int, role: str) -> str:
    """签发访问令牌：payload 含 user_id、role，并带上过期时间"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    """校验并解码令牌。合法返回 payload（含 sub/user_id、role、exp）；非法/过期返回 None"""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None