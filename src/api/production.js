/**
 * 生产管理接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockAddProductionLine,
  mockCompleteProduction,
  mockDeleteProductionLine,
  mockDeleteProductionRecord,
  mockGetProductionLines,
  mockGetProductionProgress,
  mockGetProductionRecords,
  mockMarkProductComplete,
  mockMarkProductInStock,
  mockStartProduction,
  mockUpdateProductionLine,
  LINE_STATUS,
  PRODUCT_STATUS
} from '@/mock/production'

/** 生产线列表 */
export function getProductionLines(params) {
  // return request({ url: '/biz/production/line/list', method: 'get', params })
  return mockGetProductionLines(params)
}

/** 新增生产线 */
export function addProductionLine(data) {
  // return request({ url: '/biz/production/line', method: 'post', data })
  return mockAddProductionLine(data)
}

/** 修改生产线 */
export function updateProductionLine(data) {
  // return request({ url: `/biz/production/line/${data.id}`, method: 'put', data })
  return mockUpdateProductionLine(data)
}

/** 删除生产线 */
export function deleteProductionLine(id) {
  // return request({ url: `/biz/production/line/${id}`, method: 'delete' })
  return mockDeleteProductionLine(id)
}

/** 开始生产 */
export function startProduction(id) {
  // return request({ url: `/biz/production/line/${id}/start`, method: 'post' })
  return mockStartProduction(id)
}

/** 完成生产 */
export function completeProduction(id) {
  // return request({ url: `/biz/production/line/${id}/complete`, method: 'post' })
  return mockCompleteProduction(id)
}

/** 生产档案列表 */
export function getProductionRecords(params) {
  // return request({ url: '/biz/production/record/list', method: 'get', params })
  return mockGetProductionRecords(params)
}

/** 入库操作（标记产品为已入库） */
export function markProductInStock(id) {
  // return request({ url: `/biz/production/record/${id}/instock`, method: 'post' })
  return mockMarkProductInStock(id)
}

/** 标记完成 */
export function markProductComplete(id) {
  // return request({ url: `/biz/production/record/${id}/complete`, method: 'post' })
  return mockMarkProductComplete(id)
}

/** 删除生产档案 */
export function deleteProductionRecord(id) {
  // return request({ url: `/biz/production/record/${id}`, method: 'delete' })
  return mockDeleteProductionRecord(id)
}

/** 仪表盘：生产线进度数据 */
export function getProductionProgress() {
  // return request({ url: '/biz/production/progress', method: 'get' })
  return mockGetProductionProgress()
}

export { LINE_STATUS, PRODUCT_STATUS }
