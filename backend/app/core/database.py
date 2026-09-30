"""数据库连接配置（SQLAlchemy + PostgreSQL）

密码等敏感信息一律从环境变量 / .env 读取，严禁硬编码进代码。
对外提供三件套：engine（引擎）、SessionLocal（会话工厂）、Base（模型基类）。
"""
import os

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# .env 固定位于 backend/ 根目录（本文件在 backend/app/core/ 下，向上三级）
# 用绝对路径加载，保证无论从哪个目录启动 uvicorn 都能读到
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(_BASE_DIR, ".env"))

# ---------- 从环境变量读取连接参数（.env 已在启动时注入） ----------
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "wms_dev")
DB_USER = os.getenv("DB_USER", "wms_user")
DB_PASSWORD = os.getenv("DB_PASSWORD")  # 必填，故意不设默认值，防止拿空密码悄悄连接

if not DB_PASSWORD:
    raise RuntimeError(
        "缺少数据库密码：请在 backend/.env 中配置 DB_PASSWORD（该文件已被 .gitignore 忽略，"
        "不会进入 git）。切勿把密码硬编码到代码里。"
    )

# 用 URL.create 组装连接串：密码含 @ : / 等特殊字符也不会破坏 URL 结构
DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME,
)

# engine：全局唯一数据库引擎
# pool_pre_ping=True：每次取连接前先 ping，PostgreSQL 重启后自动重连，避免拿到失效连接
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# SessionLocal：会话工厂。使用方式：with SessionLocal() as db: ...
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base：所有 ORM 模型的基类，模型类继承它后才能被 create_all 识别建表
Base = declarative_base()
