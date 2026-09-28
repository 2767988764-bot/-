/**
 * 仓库管理接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockAddWarehouse,
  mockChangeUsedArea,
  mockDeleteWarehouse,
  mockGetAllWarehouses,
  mockGetWarehouseList,
  mockGetWarehouseOptions,
  mockGetWarehouseSummary,
  mockToggleWarehouseStatus,
  mockUpdateWarehouse,
  WAREHOUSE_TYPES
} from '@/mock/warehouse'

/** 仓库列表（分页） */
export function getWarehouseList(params) {
  // return request({ url: '/biz/warehouse/list', method: 'get', params })
  return mockGetWarehouseList(params)
}

/** 全部仓库（卡片视图） */
export function getAllWarehouses() {
  // return request({ url: '/biz/warehouse/all', method: 'get' })
  return mockGetAllWarehouses()
}

/** 仓库下拉选项 */
export function getWarehouseOptions() {
  // return request({ url: '/biz/warehouse/options', method: 'get' })
  return mockGetWarehouseOptions()
}

/** 仓库容量汇总（仪表盘柱状图） */
export function getWarehouseSummary() {
  // return request({ url: '/biz/warehouse/summary', method: 'get' })
  return mockGetWarehouseSummary()
}

/** 新增仓库 */
export function addWarehouse(data) {
  // return request({ url: '/biz/warehouse', method: 'post', data })
  return mockAddWarehouse(data)
}

/** 修改仓库 */
export function updateWarehouse(data) {
  // return request({ url: `/biz/warehouse/${data.id}`, method: 'put', data })
  return mockUpdateWarehouse(data)
}

/** 删除仓库 */
export function deleteWarehouse(id) {
  // return request({ url: `/biz/warehouse/${id}`, method: 'delete' })
  return mockDeleteWarehouse(id)
}

/** 启用/停用仓库 */
export function toggleWarehouseStatus(id, status) {
  // return request({ url: `/biz/warehouse/${id}/status`, method: 'patch', data: { status } })
  return mockToggleWarehouseStatus(id, status)
}

/** 回写仓库已使用面积 */
export function changeUsedArea(warehouseId, delta) {
  // return request({ url: `/biz/warehouse/${warehouseId}/area`, method: 'patch', data: { delta } })
  return mockChangeUsedArea(warehouseId, delta)
}

export { WAREHOUSE_TYPES }
