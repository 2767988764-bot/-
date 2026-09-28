/**
 * 出入库管理接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockDeleteStockIn,
  mockGetInventoryCheckList,
  mockGetStockInList,
  mockGetStockLedger,
  mockGetStockOutList,
  mockStockInSubmit,
  mockStockOutSubmit,
  STOCK_IN_TYPES,
  STORAGE_LOCATIONS,
  DEFAULT_OCCUPY_AREA
} from '@/mock/stock'

/** 入库单列表 */
export function getStockInList(params) {
  // return request({ url: '/biz/stock-in/list', method: 'get', params })
  return mockGetStockInList(params)
}

/** 出库单列表 */
export function getStockOutList(params) {
  // return request({ url: '/biz/stock-out/list', method: 'get', params })
  return mockGetStockOutList(params)
}

/** 入库登记 */
export function stockInSubmit(data) {
  // return request({ url: '/biz/stock-in', method: 'post', data })
  return mockStockInSubmit(data)
}

/** 出库操作 */
export function stockOutSubmit(id) {
  // return request({ url: `/biz/stock-out/${id}`, method: 'post' })
  return mockStockOutSubmit(id)
}

/** 删除入库单 */
export function deleteStockIn(id) {
  // return request({ url: `/biz/stock-in/${id}`, method: 'delete' })
  return mockDeleteStockIn(id)
}

/** 出入库台账 */
export function getStockLedger(params) {
  // return request({ url: '/biz/stock/ledger', method: 'get', params })
  return mockGetStockLedger(params)
}

/** 仓库盘点列表 */
export function getInventoryCheckList(params) {
  // return request({ url: '/biz/stock/inventory-check', method: 'get', params })
  return mockGetInventoryCheckList(params)
}

export { STOCK_IN_TYPES, STORAGE_LOCATIONS, DEFAULT_OCCUPY_AREA }
