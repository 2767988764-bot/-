/**
 * 订单模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'

/** 客户名称池（与客户列表一致） */
export const CUSTOMERS = [
  '杭州云仓商贸',
  '苏州恒达物流',
  '宁波港城贸易',
  '无锡鑫源五金',
  '合肥新宇电子',
  '上海联创家居'
]

/** 商品名称池 */
export const PRODUCTS = ['精密轴承套件', '不锈钢法兰盘', '液压缸体', '铝合金支架', '齿轮箱总成', '工业传送带']

/** 支付状态枚举 */
export const PAY_STATUS = { PAID: '已付款', UNPAID: '未付款' }

/** 发货状态枚举 */
export const SHIP_STATUS = { SHIPPED: '已发货', UNSHIPPED: '未发货' }

/** 生成 156 条订单（与设计稿「共 156 条记录」一致），最新的在前 */
function buildOrders() {
  const base = new Date('2026-09-27T09:15:00').getTime()
  const day = 86400000
  const list = []
  for (let i = 0; i < 156; i++) {
    const date = new Date(base - Math.floor(i / 6) * day)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const seq = (i % 6) + 1
    const hour = String(8 + (i % 10)).padStart(2, '0')
    const minute = String((i * 7) % 60).padStart(2, '0')
    list.push({
      id: 1000 + i,
      orderNo: `N${y}${m}${d}${String(seq).padStart(3, '0')}`,
      productName: PRODUCTS[i % PRODUCTS.length],
      customer: CUSTOMERS[i % CUSTOMERS.length],
      price: 1200 + (i % 9) * 350,
      quantity: 20 + (i % 7) * 15,
      createTime: `${y}-${m}-${d} ${hour}:${minute}:00`,
      // 约 3/4 已付款，其余未付款
      payStatus: i % 4 === 3 ? PAY_STATUS.UNPAID : PAY_STATUS.PAID,
      // 约 2/5 已发货
      shipStatus: i % 5 < 2 ? SHIP_STATUS.SHIPPED : SHIP_STATUS.UNSHIPPED
    })
  }
  return list
}

export const orderList = buildOrders()

/** 订单列表查询：订单编号/商品/客户关键字 + 支付状态 + 发货状态 + 分页 */
export function mockGetOrderList(params = {}) {
  const filtered = orderList.filter(item => {
    const hitKeyword =
      like(item.orderNo, params.keyword) || like(item.productName, params.keyword) || like(item.customer, params.keyword)
    return hitKeyword && eq(item.payStatus, params.payStatus) && eq(item.shipStatus, params.shipStatus)
  })
  return reply(paginate(filtered, params))
}

/** 新建订单（订单编号后端统一生成，此处仅演示） */
export function mockAddOrder(payload) {
  const row = {
    ...clone(payload),
    id: Date.now(),
    createTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  orderList.unshift(row)
  return reply(row)
}

/** 修改订单 */
export function mockUpdateOrder(payload) {
  const index = orderList.findIndex(item => item.id === payload.id)
  if (index > -1) orderList.splice(index, 1, { ...orderList[index], ...clone(payload) })
  return reply(orderList[index])
}

/** 删除订单 */
export function mockDeleteOrder(id) {
  const index = orderList.findIndex(item => item.id === id)
  if (index > -1) orderList.splice(index, 1)
  return reply(true)
}

/** 标记支付状态 */
export function mockUpdatePayStatus(id, payStatus) {
  const row = orderList.find(item => item.id === id)
  if (row) row.payStatus = payStatus
  return reply(true)
}

/** 发货：回写订单发货状态 */
export function mockShipOrder(id, payload = {}) {
  const row = orderList.find(item => item.id === id)
  if (row) row.shipStatus = SHIP_STATUS.SHIPPED
  return reply({ ...clone(row), ...clone(payload) })
}

/** 首页仪表盘「近期订单」：取最新 6 条 */
export function mockGetRecentOrders() {
  return reply(clone(orderList.slice(0, 6)))
}