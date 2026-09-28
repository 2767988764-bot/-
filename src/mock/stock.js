/**
 * 出入库模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'
import { CUSTOMERS, PRODUCTS } from './order'

/** 入库类型枚举 */
export const STOCK_IN_TYPES = ['生产入库', '采购入库', '退货入库', '调拨入库']

/** 存储位置枚举（货架编号） */
export const STORAGE_LOCATIONS = ['A-01 货架', 'A-02 货架', 'B-01 货架', 'B-02 货架', 'C-01 货区', 'C-02 货区']

/** 单件默认占用面积（设计稿默认值：货架水平占地面积 10 ㎡） */
export const DEFAULT_OCCUPY_AREA = 10

/** 生成 24 条入库单 */
function buildStockInList() {
  const base = new Date('2026-09-27T08:40:00').getTime()
  const day = 86400000
  const warehousePool = ['W1 普通仓库', 'W2 普通仓库', 'T1 待检库', 'G1 废品库']
  const list = []
  for (let i = 0; i < 24; i++) {
    const date = new Date(base - Math.floor(i / 4) * day)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    list.push({
      id: 5000 + i,
      goodsNo: `G${y}${m}${d}${String((i % 4) + 1).padStart(3, '0')}`,
      orderNo: `N${y}${m}${d}${String((i % 6) + 1).padStart(3, '0')}`,
      goodsName: PRODUCTS[i % PRODUCTS.length],
      warehouse: warehousePool[i % warehousePool.length],
      quantity: 20 + (i % 7) * 15,
      occupyArea: (i % 4 + 1) * DEFAULT_OCCUPY_AREA,
      customer: CUSTOMERS[i % CUSTOMERS.length],
      location: STORAGE_LOCATIONS[i % STORAGE_LOCATIONS.length],
      inType: STOCK_IN_TYPES[i % STOCK_IN_TYPES.length],
      operator: ['王建国', '孙立', '周敏', '赵小雨'][i % 4],
      inTime: `${y}-${m}-${d} ${String(8 + (i % 8)).padStart(2, '0')}:40:00`,
      status: '已入库'
    })
  }
  return list
}

/** 生成 18 条出库单（由入库单派生） */
function buildStockOutList() {
  return buildStockInList()
    .slice(0, 18)
    .map((item, i) => ({
      ...item,
      id: 7000 + i,
      outStatus: i % 3 === 0 ? '已出库' : '待出库',
      outTime: i % 3 === 0 ? item.inTime.replace('08:40', '15:30') : '',
      outOperator: i % 3 === 0 ? item.operator : ''
    }))
}

export const stockInList = buildStockInList()
export const stockOutList = buildStockOutList()

/** 入库单列表查询 */
export function mockGetStockInList(params = {}) {
  const filtered = stockInList.filter(item => {
    const hitKeyword = like(item.goodsNo, params.keyword) || like(item.orderNo, params.keyword) || like(item.goodsName, params.keyword)
    return hitKeyword && eq(item.warehouse, params.warehouse) && eq(item.inType, params.inType)
  })
  return reply(paginate(filtered, params))
}

/** 出库单列表查询 */
export function mockGetStockOutList(params = {}) {
  const filtered = stockOutList.filter(item => {
    const hitKeyword =
      like(item.goodsNo, params.keyword) || like(item.orderNo, params.keyword) || like(item.goodsName, params.keyword) || like(item.customer, params.keyword)
    return hitKeyword && eq(item.outStatus, params.outStatus) && eq(item.warehouse, params.warehouse)
  })
  return reply(paginate(filtered, params))
}

/** 入库登记：生成新入库单 */
export function mockStockInSubmit(payload) {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const row = {
    id: Date.now(),
    goodsNo: `G${y}${m}${d}${String(stockInList.length + 1).padStart(3, '0')}`,
    orderNo: payload.orderNo || '',
    goodsName: payload.goodsName,
    warehouse: payload.warehouse,
    quantity: payload.quantity,
    occupyArea: payload.occupyArea,
    customer: payload.customer || '',
    location: payload.location,
    inType: payload.inType,
    operator: payload.operator || '当前登录人',
    inTime: `${y}-${m}-${d} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`,
    status: '已入库'
  }
  stockInList.unshift(row)
  return reply(row)
}

/** 出库操作：回写出库状态 */
export function mockStockOutSubmit(id, operator = '当前登录人') {
  const row = stockOutList.find(item => item.id === id)
  if (row) {
    row.outStatus = '已出库'
    row.outOperator = operator
    row.outTime = new Date().toLocaleString('zh-CN', { hour12: false })
  }
  return reply(clone(row))
}

/** 删除入库单 */
export function mockDeleteStockIn(id) {
  const index = stockInList.findIndex(item => item.id === id)
  if (index > -1) stockInList.splice(index, 1)
  return reply(true)
}

/** 出入库台账（报表统计页 / 我的仓库明细） */
export function mockGetStockLedger(params = {}) {
  const ledger = [
    ...stockInList.map(item => ({
      id: 'in-' + item.id,
      date: item.inTime.slice(0, 10),
      goodsNo: item.goodsNo,
      type: '入库',
      goodsName: item.goodsName,
      quantity: item.quantity,
      warehouse: item.warehouse,
      operator: item.operator
    })),
    ...stockOutList.filter(item => item.outStatus === '已出库').map(item => ({
      id: 'out-' + item.id,
      date: item.outTime.slice(0, 10),
      goodsNo: item.goodsNo,
      type: '出库',
      goodsName: item.goodsName,
      quantity: item.quantity,
      warehouse: item.warehouse,
      operator: item.outOperator
    }))
  ].sort((a, b) => (a.date < b.date ? 1 : -1))

  const filtered = ledger.filter(item => like(item.goodsNo, params.keyword) || like(item.goodsName, params.keyword))
  return reply(paginate(filtered, params))
}

/** 仓库盘点：按仓库返回账面数量与实盘数量 */
export function mockGetInventoryCheckList(params = {}) {
  const list = stockInList.slice(0, 12).map((item, i) => ({
    id: 9000 + i,
    goodsNo: item.goodsNo,
    goodsName: item.goodsName,
    warehouse: item.warehouse,
    bookQuantity: item.quantity,
    actualQuantity: i % 4 === 0 ? item.quantity - 2 : item.quantity,
    remark: i % 4 === 0 ? '盘亏 2 件' : '账实相符'
  }))
  const filtered = list.filter(item => like(item.goodsNo, params.keyword) || like(item.goodsName, params.keyword))
  return reply(paginate(filtered, params))
}