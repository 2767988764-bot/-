"""模型包：导入即注册到 Base.metadata，main.py 里 import 本包即可让 create_all 建出所有表"""
from app.models.user import User  # noqa: F401
from app.models.order import Order  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.warehouse import Warehouse  # noqa: F401
from app.models.stock import StockIn, StockOut, StockLedger  # noqa: F401
