"""统一响应封装：所有接口返回 { code, message, data } 结构。

结合 main.py 注册的 HTTPException 处理器，成功/业务错误/鉴权错误
的响应体都统一成该结构，满足前端 request.js 的拦截约定。
"""
from typing import Any

from fastapi.responses import JSONResponse


def ok(data: Any = None) -> JSONResponse:
    """成功响应，HTTP 200，data 可为任意值"""
    return JSONResponse({"code": 200, "message": "success", "data": data})


def fail(code: int, message: str, http_status: int | None = None) -> JSONResponse:
    """业务错误响应：HTTP 状态默认等于 code（300~599 视为合法状态码）。

    例如 fail(400, "用户名已存在") -> 返回 HTTP 400 + body {code:400,...}。
    """
    status = http_status if http_status is not None else code
    return JSONResponse(status_code=status, content={"code": code, "message": message, "data": None})