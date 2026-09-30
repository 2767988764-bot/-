/**
 * 仓库管理接口
 */
import request from '@/utils/request'

/** 仓库类型枚举（与 src/mock/warehouse.js 一致） */
export const WAREHOUSE_TYPES = ['普通仓库', '待检库', '废品库']

/** 仓库状态：1 启用 / 0 停用 */
export const WAREHOUSE_STATUS = { ENABLED: 1, DISABLED: 0 }

/** 仓库列表（分页） */
export function getWarehouseList(params) {
  return request({ url: '/biz/warehouse/list', method: 'get', params })
}

/** 全部仓库（卡片视图） */
export function getAllWarehouses() {
  return request({ url: '/biz/warehouse/all', method: 'get' })
}

/** 仓库下拉选项 */
export function getWarehouseOptions() {
  return request({ url: '/biz/warehouse/options', method: 'get' })
}

/** 仓库容量汇总（仪表盘柱状图） */
export function getWarehouseSummary() {
  return request({ url: '/biz/warehouse/summary', method: 'get' })
}

/** 新增仓库 */
export function addWarehouse(data) {
  return request({ url: '/biz/warehouse', method: 'post', data })
}

/** 修改仓库 */
export function updateWarehouse(data) {
  return request({ url: `/biz/warehouse/${data.id}`, method: 'put', data })
}

/** 删除仓库 */
export function deleteWarehouse(id) {
  return request({ url: `/biz/warehouse/${id}`, method: 'delete' })
}

/** 启用/停用仓库 */
export function toggleWarehouseStatus(id, status) {
  return request({ url: `/biz/warehouse/${id}/status`, method: 'patch', data: { status } })
}

/** 回写仓库已使用面积 */
export function changeUsedArea(warehouseId, delta) {
  return request({ url: `/biz/warehouse/${warehouseId}/area`, method: 'patch', data: { delta } })
}