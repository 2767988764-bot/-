"""内存版登录失败锁定机制（开发期用，后续可替换为 Redis）。

规则：
    连续失败 MAX_ATTEMPTS 次 -> 锁定该用户名 LOCK_MINUTES 分钟；
    锁定期间即使密码正确也拒绝（返回 429）；
    登录成功后重置失败计数；密码错误则计数 +1。

注意：模块级字典只在单进程内生效。若改用 uvicorn 多 worker，
锁会不均分，生产环境务必用 Redis 统一存储。
"""
import threading
import time
from datetime import datetime, timedelta, timezone

# 可调参数
MAX_ATTEMPTS = 5          # 连续失败多少次触发锁定
LOCK_MINUTES = 15         # 锁定时长（分钟）

# 用户名 -> {"fail_count": int, "locked_until": datetime|None}
_lock_state: dict[str, dict] = {}
# 进程内加锁，避免并发读写竞态
_lock = threading.Lock()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def is_locked(username: str) -> bool:
    """该用户名当前是否处于锁定状态（成功/失败都判断）"""
    with _lock:
        rec = _lock_state.get(username)
        if not rec or rec["locked_until"] is None:
            return False
        if _now() < rec["locked_until"]:
            return True
        # 已过期的锁：清掉，视为未锁定
        rec["locked_until"] = None
        rec["fail_count"] = 0
        return False


def register_failure(username: str) -> bool:
    """记录一次密码错误；返回 True 表示本次达到了锁定阈值、应当锁定。"""
    with _lock:
        rec = _lock_state.setdefault(username, {"fail_count": 0, "locked_until": None})
        rec["fail_count"] += 1
        if rec["fail_count"] >= MAX_ATTEMPTS:
            rec["locked_until"] = _now() + timedelta(minutes=LOCK_MINUTES)
            rec["fail_count"] = 0  # 重新计数，为下次解锁后的新一轮做准备
            return True
        return False


def reset(username: str) -> None:
    """登录成功：清除该用户名的失败计数与锁定状态"""
    with _lock:
        _lock_state.pop(username, None)