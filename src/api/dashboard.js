/**
 * 仪表盘接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockGetDashboardOrders,
  mockGetDashboardStats,
  mockGetProductionChart,
  mockGetWarehouseChart,
  mockGetWeather
} from '@/mock/dashboard'

/** 统计卡片 */
export function getDashboardStats() {
  // return request({ url: '/biz/dashboard/stats', method: 'get' })
  return mockGetDashboardStats()
}

/** 仓库容量柱状图 */
export function getWarehouseChart() {
  // return request({ url: '/biz/dashboard/warehouse-chart', method: 'get' })
  return mockGetWarehouseChart()
}

/** 生产线进度环形图 */
export function getProductionChart() {
  // return request({ url: '/biz/dashboard/production-chart', method: 'get' })
  return mockGetProductionChart()
}

/** 近期订单表格 */
export function getDashboardOrders() {
  // return request({ url: '/biz/dashboard/recent-orders', method: 'get' })
  return mockGetDashboardOrders()
}

/** 天气信息 */
export function getWeather() {
  // return request({ url: '/biz/dashboard/weather', method: 'get' })
  return mockGetWeather()
}
