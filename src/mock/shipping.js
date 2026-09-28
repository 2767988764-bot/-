/**
 * 发货模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'
import { CUSTOMERS, PRODUCTS } from './order'

/** 物流公司池 */
export const LOGISTICS_COMPANIES = ['顺丰速运', '德邦物流', '中通快运', '京东物流']

/** 发货单状态枚举 */
export const SHIP_ORDER_STATUS = ['待发货', '运输中', '已签收']

/** 生成 24 条发货单 */
function buildShippingList() {
  const base = new Date('2026-09-27T10:20:00').getTime()
  const day = 86400000
  const list = []
  for (let i = 0; i < 24; i++) {
    const date = new Date(base - Math.floor(i / 4) * day)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    list.push({
      id: 3000 + i,
      shippingNo: `FH${y}${m}${d}${String((i % 4) + 1).padStart(3, '0')}`,
      orderNo: `N${y}${m}${d}${String((i % 6) + 1).padStart(3, '0')}`,
      customer: CUSTOMERS[i % CUSTOMERS.length],
      goods: PRODUCTS[i % PRODUCTS.length],
      quantity: 20 + (i % 7) * 15,
      logistics: LOGISTICS_COMPANIES[i % LOGISTICS_COMPANIES.length],
      trackingNo: `SF${String(700000000000 + i * 137).slice(0, 12)}`,
      status: SHIP_ORDER_STATUS[i % 3],
      shipTime: `${y}-${m}-${d} ${String(10 + (i % 8)).padStart(2, '0')}:20:00`
    })
  }
  return list
}

export const shippingList = buildShippingList()

/** 发货单列表查询 */
export function mockGetShippingList(params = {}) {
  const filtered = shippingList.filter(item => {
    const hitKeyword =
      like(item.shippingNo, params.keyword) || like(item.orderNo, params.keyword) || like(item.customer, params.keyword)
    return hitKeyword && eq(item.status, params.status)
  })
  return reply(paginate(filtered, params))
}

/** 确认发货 */
export function mockConfirmShipping(id, payload = {}) {
  const row = shippingList.find(item => item.id === id)
  if (row) {
    row.logistics = payload.logistics || row.logistics
    row.trackingNo = payload.trackingNo || row.trackingNo
    row.status = '运输中'
  }
  return reply(clone(row))
}

/** 删除发货单 */
export function mockDeleteShipping(id) {
  const index = shippingList.findIndex(item => item.id === id)
  if (index > -1) shippingList.splice(index, 1)
  return reply(true)
}