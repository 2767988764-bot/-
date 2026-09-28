/**
 * 仪表盘 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { reply, clone } from './helper'
import { mockGetWarehouseSummary } from './warehouse'
import { mockGetProductionProgress } from './production'
import { mockGetRecentOrders } from './order'

/** 仪表盘统计卡片 */
export function mockGetDashboardStats() {
  return reply([
    { label: '今日订单', value: 12, unit: '单', trend: '+8%' },
    { label: '待入库', value: 5, unit: '单', trend: '-2' },
    { label: '待出库', value: 3, unit: '单', trend: '+1' },
    { label: '在产产线', value: 3, unit: '条', trend: '持平' }
  ])
}

/** 仓库容量柱状图数据 */
export async function mockGetWarehouseChart() {
  const summary = await mockGetWarehouseSummary()
  return reply({
    title: '仓库库存状态',
    subtitle: '已使用面积 / 总容量（㎡）',
    data: clone(summary)
  })
}

/** 生产线进度环形图数据 */
export async function mockGetProductionChart() {
  const data = await mockGetProductionProgress()
  return reply({
    title: '生产线进度',
    subtitle: '3 条产线运行中',
    data: clone(data)
  })
}

/** 近期订单表格数据 */
export async function mockGetDashboardOrders() {
  return mockGetRecentOrders()
}

/** 天气预报（占位） */
export function mockGetWeather() {
  return reply({
    city: '杭州市',
    date: '2026-09-28 周日',
    temperature: 22,
    weather: '多云',
    humidity: 65,
    wind: '东南风 3级',
    suggestions: '天气适宜，适合仓储搬运与物流配送作业。'
  })
}