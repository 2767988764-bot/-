/**
 * 生产模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'
import { PRODUCTS, CUSTOMERS } from './order'

/** 生产线状态枚举 */
export const LINE_STATUS = { IDLE: '待开始', RUNNING: '运行中', DONE: '已完成' }

/** 产品状态枚举（生产档案用） */
export const PRODUCT_STATUS = { NOT_IN: '未入库', IN_STOCK: '已入库' }

/** 生成 3 条生产线（与设计稿仪表盘环形图一致） */
export const productionLines = [
  {
    id: 1,
    name: '一号生产线',
    orderNo: 'PO-20260921-003',
    goodsName: '精密轴承套件',
    planQuantity: 1200,
    completedQuantity: 984,
    progress: 82,
    description: '主产线，负责精密轴承套件加工，当前运行效率良好',
    status: '运行中',
    enable: 1,
    createTime: '2026-09-21 08:00:00'
  },
  {
    id: 2,
    name: '二号生产线',
    orderNo: 'PO-20260923-011',
    goodsName: '不锈钢法兰盘',
    planQuantity: 800,
    completedQuantity: 360,
    progress: 45,
    description: '副产线，负责不锈钢法兰盘生产，正在调试新模具',
    status: '运行中',
    enable: 1,
    createTime: '2026-09-23 09:30:00'
  },
  {
    id: 3,
    name: '三号生产线',
    orderNo: 'PO-20260925-018',
    goodsName: '铝合金支架',
    planQuantity: 2000,
    completedQuantity: 360,
    progress: 18,
    description: '新建产线，负责铝合金支架量产，处于爬坡阶段',
    status: '运行中',
    enable: 1,
    createTime: '2026-09-25 14:00:00'
  }
]

/** 生成 30 条生产档案记录 */
function buildProductionRecords() {
  const list = []
  const statuses = [PRODUCT_STATUS.NOT_IN, PRODUCT_STATUS.IN_STOCK]
  for (let i = 0; i < 30; i++) {
    const plan = 500 + (i % 8) * 200
    const completed = i % 3 === 0 ? plan : Math.floor(plan * (0.3 + (i % 7) * 0.1))
    list.push({
      id: 6000 + i,
      orderNo: `PO-2026092${(i % 9) + 1}-${String(i + 1).padStart(3, '0')}`,
      productName: PRODUCTS[i % PRODUCTS.length],
      planQuantity: plan,
      actualQuantity: completed,
      line: ['一号生产线', '二号生产线', '三号生产线'][i % 3],
      productStatus: statuses[i % 2],
      createTime: `2026-09-${String((i % 28) + 1).padStart(2, '0')} 10:00:00`
    })
  }
  return list
}

export const productionRecords = buildProductionRecords()

/** 生产线列表查询 */
export function mockGetProductionLines(params = {}) {
  const filtered = productionLines.filter(item => like(item.name, params.keyword) || like(item.orderNo, params.keyword))
  return reply(clone(filtered))
}

/** 新增生产线 */
export function mockAddProductionLine(payload) {
  const row = {
    ...clone(payload),
    id: Date.now(),
    completedQuantity: 0,
    progress: 0,
    status: '待开始',
    enable: 1,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  productionLines.push(row)
  return reply(row)
}

/** 修改生产线 */
export function mockUpdateProductionLine(payload) {
  const index = productionLines.findIndex(item => item.id === payload.id)
  if (index > -1) {
    const merged = { ...productionLines[index], ...clone(payload) }
    if (merged.planQuantity > 0) {
      merged.progress = Math.round((merged.completedQuantity / merged.planQuantity) * 100)
    }
    productionLines.splice(index, 1, merged)
  }
  return reply(productionLines[index])
}

/** 删除生产线 */
export function mockDeleteProductionLine(id) {
  const index = productionLines.findIndex(item => item.id === id)
  if (index > -1) productionLines.splice(index, 1)
  return reply(true)
}

/** 开始生产 */
export function mockStartProduction(id) {
  const row = productionLines.find(item => item.id === id)
  if (row) row.status = '运行中'
  return reply(clone(row))
}

/** 完成生产 */
export function mockCompleteProduction(id) {
  const row = productionLines.find(item => item.id === id)
  if (row) {
    row.status = '已完成'
    row.completedQuantity = row.planQuantity
    row.progress = 100
  }
  return reply(clone(row))
}

/** 生产档案列表查询 */
export function mockGetProductionRecords(params = {}) {
  const filtered = productionRecords.filter(item => {
    const hitKeyword = like(item.orderNo, params.keyword) || like(item.productName, params.keyword)
    return hitKeyword && eq(item.productStatus, params.productStatus) && eq(item.line, params.line)
  })
  return reply(paginate(filtered, params))
}

/** 入库操作：标记产品状态为已入库 */
export function mockMarkProductInStock(id) {
  const row = productionRecords.find(item => item.id === id)
  if (row) row.productStatus = PRODUCT_STATUS.IN_STOCK
  return reply(clone(row))
}

/** 标记完成 */
export function mockMarkProductComplete(id) {
  const row = productionRecords.find(item => item.id === id)
  if (row) {
    row.actualQuantity = row.planQuantity
    const line = productionLines.find(line => line.name === row.line)
    if (line) {
      line.completedQuantity += row.planQuantity
      line.progress = Math.round((line.completedQuantity / line.planQuantity) * 100)
    }
  }
  return reply(clone(row))
}

/** 删除生产档案 */
export function mockDeleteProductionRecord(id) {
  const index = productionRecords.findIndex(item => item.id === id)
  if (index > -1) productionRecords.splice(index, 1)
  return reply(true)
}

/** 仪表盘：生产线进度环形图数据 */
export function mockGetProductionProgress() {
  return reply(clone(productionLines.map(item => ({
    name: item.name,
    orderNo: item.orderNo,
    completed: item.completedQuantity,
    total: item.planQuantity,
    progress: item.progress
  }))))
}