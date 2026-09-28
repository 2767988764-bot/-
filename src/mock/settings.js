/**
 * 系统设置 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, reply, paginate, eq } from './helper'

/** 系统基础配置 */
let systemConfig = {
  systemName: '仓储物流管理系统',
  logoUrl: '',
  orderNoRule: 'N + yyyyMMdd + 3位序号',
  stockNoRule: 'G + yyyyMMdd + 3位序号',
  defaultArea: 10
}

/** 获取系统基础配置 */
export function mockGetSystemConfig() {
  return reply(clone(systemConfig))
}

/** 更新系统基础配置 */
export function mockUpdateSystemConfig(payload) {
  systemConfig = { ...systemConfig, ...clone(payload) }
  return reply(clone(systemConfig))
}

// ======================== 数据字典 ========================

/** 字典分类列表 */
export const dictCategories = [
  { id: 1, name: '订单状态', code: 'order_status', remark: '订单的流转状态', status: 1, itemCount: 6 },
  { id: 2, name: '支付状态', code: 'pay_status', remark: '订单支付状态', status: 1, itemCount: 2 },
  { id: 3, name: '发货状态', code: 'ship_status', remark: '订单发货状态', status: 1, itemCount: 2 },
  { id: 4, name: '入库类型', code: 'stock_in_type', remark: '入库单类型', status: 1, itemCount: 3 },
  { id: 5, name: '仓库类型', code: 'warehouse_type', remark: '仓库分类', status: 1, itemCount: 4 },
  { id: 6, name: '产品状态', code: 'product_status', remark: '生产产品状态', status: 0, itemCount: 2 }
]

/** 字典项列表 */
export const dictItems = [
  { id: 101, categoryId: 1, label: '待付款', value: '0', sort: 1, status: 1 },
  { id: 102, categoryId: 1, label: '已付款', value: '1', sort: 2, status: 1 },
  { id: 103, categoryId: 1, label: '已发货', value: '2', sort: 3, status: 1 },
  { id: 104, categoryId: 1, label: '已签收', value: '3', sort: 4, status: 1 },
  { id: 105, categoryId: 1, label: '已取消', value: '4', sort: 5, status: 1 },
  { id: 106, categoryId: 1, label: '已退款', value: '5', sort: 6, status: 0 },
  { id: 201, categoryId: 2, label: '未付款', value: '0', sort: 1, status: 1 },
  { id: 202, categoryId: 2, label: '已付款', value: '1', sort: 2, status: 1 },
  { id: 301, categoryId: 3, label: '未发货', value: '0', sort: 1, status: 1 },
  { id: 302, categoryId: 3, label: '已发货', value: '1', sort: 2, status: 1 },
  { id: 401, categoryId: 4, label: '生产入库', value: '1', sort: 1, status: 1 },
  { id: 402, categoryId: 4, label: '退货入库', value: '2', sort: 2, status: 1 },
  { id: 403, categoryId: 4, label: '调拨入库', value: '3', sort: 3, status: 0 },
  { id: 501, categoryId: 5, label: '待检库', value: 'T', sort: 1, status: 1 },
  { id: 502, categoryId: 5, label: '普通仓库', value: 'W', sort: 2, status: 1 },
  { id: 503, categoryId: 5, label: '废品库', value: 'G', sort: 3, status: 1 },
  { id: 504, categoryId: 5, label: '冷藏库', value: 'C', sort: 4, status: 0 },
  { id: 601, categoryId: 6, label: '未入库', value: '0', sort: 1, status: 1 },
  { id: 602, categoryId: 6, label: '已入库', value: '1', sort: 2, status: 1 }
]

/** 查询字典分类列表 */
export function mockGetDictCategories(params = {}) {
  const list = dictCategories.filter(c => c.status === params.status || params.status === undefined)
  return reply(clone(list))
}

/** 查询某分类下的字典项 */
export function mockGetDictItems(categoryId, params = {}) {
  const filtered = dictItems.filter(item => eq(item.categoryId, categoryId))
  return reply(paginate(filtered, params))
}

/** 新增字典分类 */
export function mockAddDictCategory(payload) {
  const row = { ...clone(payload), id: Date.now(), itemCount: 0 }
  dictCategories.push(row)
  return reply(row)
}

/** 编辑字典分类 */
export function mockUpdateDictCategory(payload) {
  const idx = dictCategories.findIndex(c => c.id === payload.id)
  if (idx > -1) dictCategories.splice(idx, 1, { ...dictCategories[idx], ...clone(payload) })
  return reply(dictCategories[idx])
}

/** 启用/禁用字典分类 */
export function mockToggleDictCategoryStatus(id, status) {
  const row = dictCategories.find(c => c.id === id)
  if (row) row.status = status
  return reply(true)
}

/** 新增字典项 */
export function mockAddDictItem(payload) {
  const row = { ...clone(payload), id: Date.now() }
  dictItems.push(row)
  return reply(row)
}

/** 编辑字典项 */
export function mockUpdateDictItem(payload) {
  const idx = dictItems.findIndex(i => i.id === payload.id)
  if (idx > -1) dictItems.splice(idx, 1, { ...dictItems[idx], ...clone(payload) })
  return reply(dictItems[idx])
}

/** 启用/禁用字典项 */
export function mockToggleDictItemStatus(id, status) {
  const row = dictItems.find(i => i.id === id)
  if (row) row.status = status
  return reply(true)
}
