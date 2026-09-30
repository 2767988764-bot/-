/**
 * 出入库管理接口
 */
import request from '@/utils/request'

/** 入库类型枚举（与 src/mock/stock.js 一致） */
export const STOCK_IN_TYPES = ['生产入库', '采购入库', '退货入库', '调拨入库']

/** 存储位置枚举（与 src/mock/stock.js 一致） */
export const STORAGE_LOCATIONS = ['A-01 货架', 'A-02 货架', 'B-01 货架', 'B-02 货架', 'C-01 货区', 'C-02 货区']

/** 单件默认占用面积（设计稿默认值：货架水平占地面积 10 ㎡） */
export const DEFAULT_OCCUPY_AREA = 10

/** 入库单列表 */
export function getStockInList(params) {
  return request({ url: '/biz/stock-in/list', method: 'get', params })
}

/** 出库单列表 */
export function getStockOutList(params) {
  return request({ url: '/biz/stock-out/list', method: 'get', params })
}

/** 入库登记 */
export function stockInSubmit(data) {
  return request({ url: '/biz/stock-in', method: 'post', data })
}

/** 出库操作 */
export function stockOutSubmit(id) {
  return request({ url: `/biz/stock-out/${id}`, method: 'post' })
}

/** 删除入库单 */
export function deleteStockIn(id) {
  return request({ url: `/biz/stock-in/${id}`, method: 'delete' })
}

/** 出入库台账 */
export function getStockLedger(params) {
  return request({ url: '/biz/stock/ledger', method: 'get', params })
}

/** 仓库盘点列表 */
export function getInventoryCheckList(params) {
  return request({ url: '/biz/stock/inventory-check', method: 'get', params })
}