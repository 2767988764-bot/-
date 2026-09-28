/**
 * 仓库模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'

/** 仓库类型枚举（与设计稿一致：待检库 T1 / 普通仓库 W1、W2 / 废品库 G1） */
export const WAREHOUSE_TYPES = ['普通仓库', '待检库', '废品库']

/** 仓库列表假数据 */
export const warehouseList = [
  {
    id: 1,
    code: 'W1',
    name: 'W1 普通仓库',
    type: '普通仓库',
    totalArea: 900,
    usedArea: 620,
    address: '杭州市余杭区仓前路18号',
    manager: '王建国',
    phone: '13701234567',
    status: 1,
    createTime: '2026-01-10 09:00:00'
  },
  {
    id: 2,
    code: 'W2',
    name: 'W2 普通仓库',
    type: '普通仓库',
    totalArea: 800,
    usedArea: 380,
    address: '苏州市吴中区物流大道66号',
    manager: '孙立',
    phone: '13512349876',
    status: 1,
    createTime: '2026-01-10 09:00:00'
  },
  {
    id: 3,
    code: 'T1',
    name: 'T1 待检库',
    type: '待检库',
    totalArea: 300,
    usedArea: 120,
    address: '杭州市余杭区仓前路18号',
    manager: '周敏',
    phone: '13487651230',
    status: 1,
    createTime: '2026-01-10 09:00:00'
  },
  {
    id: 4,
    code: 'G1',
    name: 'G1 废品库',
    type: '废品库',
    totalArea: 200,
    usedArea: 62,
    address: '宁波市北仑区港城路9号',
    manager: '赵小雨',
    phone: '13609871234',
    status: 1,
    createTime: '2026-01-10 09:00:00'
  }
]

/** 计算派生字段：实际可使用面积、使用率 */
export function withDerived(item) {
  const usableArea = Math.max(item.totalArea - item.usedArea, 0)
  const usageRate = item.totalArea ? Math.round((item.usedArea / item.totalArea) * 100) : 0
  return { ...item, usableArea, usageRate }
}

/** 仓库列表查询 */
export function mockGetWarehouseList(params = {}) {
  const filtered = warehouseList.filter(item => {
    const hitKeyword = like(item.code, params.keyword) || like(item.name, params.keyword) || like(item.address, params.keyword)
    return hitKeyword && eq(item.type, params.type) && eq(item.status, params.status)
  })
  const paged = paginate(filtered, params)
  paged.list = paged.list.map(withDerived)
  return reply(paged)
}

/** 全部仓库（我的仓库卡片 / 入库弹窗下拉） */
export function mockGetAllWarehouses() {
  return reply(clone(warehouseList.map(withDerived)))
}

/** 仓库下拉选项 */
export function mockGetWarehouseOptions() {
  return reply(clone(warehouseList.filter(item => item.status === 1).map(item => ({ id: item.id, code: item.code, name: item.name, usableArea: Math.max(item.totalArea - item.usedArea, 0) }))))
}

/** 新增仓库 */
export function mockAddWarehouse(payload) {
  const row = { ...clone(payload), id: Date.now(), usedArea: 0, status: payload.status === undefined ? 1 : payload.status }
  warehouseList.push(row)
  return reply(withDerived(row))
}

/** 修改仓库 */
export function mockUpdateWarehouse(payload) {
  const index = warehouseList.findIndex(item => item.id === payload.id)
  if (index > -1) warehouseList.splice(index, 1, { ...warehouseList[index], ...clone(payload) })
  return reply(withDerived(warehouseList[index]))
}

/** 删除仓库 */
export function mockDeleteWarehouse(id) {
  const index = warehouseList.findIndex(item => item.id === id)
  if (index > -1) warehouseList.splice(index, 1)
  return reply(true)
}

/** 启用 / 停用仓库 */
export function mockToggleWarehouseStatus(id, status) {
  const row = warehouseList.find(item => item.id === id)
  if (row) row.status = status
  return reply(true)
}

/**
 * 回写仓库已使用面积（入库 +占用面积 / 出库 -占用面积）
 * 【业务逻辑待后端对接时完善】前端仅做本地数据同步，真实校验由后端负责
 */
export function mockChangeUsedArea(warehouseId, delta) {
  const row = warehouseList.find(item => item.id === warehouseId)
  if (row) row.usedArea = Math.max(0, Math.min(row.totalArea, row.usedArea + delta))
  return reply(withDerived(row))
}

/** 仓库资料汇总（仪表盘柱状图数据源） */
export function mockGetWarehouseSummary() {
  return reply(
    clone(
      warehouseList.map(item => ({
        code: item.code,
        name: item.name,
        usedArea: item.usedArea,
        totalArea: item.totalArea
      }))
    )
  )
}