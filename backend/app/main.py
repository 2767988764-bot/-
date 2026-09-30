"""FastAPI 应用入口

启动方式（backend 目录下，已激活 venv）：
    uvicorn app.main:app --reload --port 9090
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.database import Base, engine
from app.routes.auth import router as auth_router
from app.routes.user import router as user_router
from app.routes.profile import router as profile_router
from app.routes.order import router as order_router
from app.routes.customer import router as customer_router
from app.routes.warehouse import router as warehouse_router
from app.routes.stock import router as stock_router
import app.models  # noqa: F401  导入模型包，把所有表注册进 Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时自动建表（已存在的表跳过，幂等），关闭时释放连接池"""
    Base.metadata.create_all(bind=engine)
    yield
    engine.dispose()


app = FastAPI(title="WMS 仓储物流后端", lifespan=lifespan)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """把所有 HTTPException 统一转成 { code, message, data } 结构，满足前端约定"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": exc.detail, "data": None},
    )


# 挂载认证路由：/auth/register、/auth/login
app.include_router(auth_router)
# 挂载用户管理路由：/system/user/...、/system/roles/options
app.include_router(user_router)
# 挂载个人中心路由：/system/profile/...
app.include_router(profile_router)
# 挂载订单路由：/biz/order/...
app.include_router(order_router)
# 挂载客户路由：/biz/customer/...
app.include_router(customer_router)
# 挂载仓库路由：/biz/warehouse/...
app.include_router(warehouse_router)
# 挂载出入库路由：/biz/stock-...、/biz/stock/...
app.include_router(stock_router)


@app.get("/")
def health():
    return {"status": "ok", "service": "wms-backend"}
