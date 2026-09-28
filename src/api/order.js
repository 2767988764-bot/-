/**
 * 订单管理接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockAddOrder,
  mockDeleteOrder,
  mockGetOrderList,
  mockGetRecentOrders,
  mockShipOrder,
  mockUpdateOrder,
  mockUpdatePayStatus,
  PAY_STATUS,
  SHIP_STATUS
} from '@/mock/order'

/**
 * 分页查询订单列表
 * @param {Object} params
 * @param {string} [params.keyword]   订单编号/商品/客户关键字
 * @param {string} [params.payStatus]  支付状态：已付款 | 未付款
 * @param {string} [params.shipStatus] 发货状态：已发货 | 未发货
 * @param {number} [params.page]
 * @param {number} [params.pageSize]
 * @returns {Promise<{list: Array, total: number}>}
 *          list[].{ id, orderNo, productName, customer, price, quantity, createTime, payStatus, shipStatus }
 */
export function getOrderList(params) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/biz/order/list', method: 'get', params })
  return mockGetOrderList(params)
}

/**
 * 新建订单（订单编号后端自动生成）
 * @param {Object} data
 * @param {string} data.productName 商品名称
 * @param {string} data.customer    客户
 * @param {number} data.price       单价
 * @param {number} data.quantity    数量
 * @param {string} [data.payStatus] 支付状态
 * @returns {Promise<Object>}
 */
export function addOrder(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/biz/order', method: 'post', data })
  return mockAddOrder(data)
}

/** 修改订单 */
export function updateOrder(data) {
  // return request({ url: `/biz/order/${data.id}`, method: 'put', data })
  return mockUpdateOrder(data)
}

/** 删除订单 */
export function deleteOrder(id) {
  // return request({ url: `/biz/order/${id}`, method: 'delete' })
  return mockDeleteOrder(id)
}

/** 标记支付状态 */
export function updatePayStatus(id, payStatus) {
  // return request({ url: `/biz/order/${id}/pay`, method: 'patch', data: { payStatus } })
  return mockUpdatePayStatus(id, payStatus)
}

/** 发货操作 */
export function shipOrder(id, payload) {
  // return request({ url: `/biz/order/${id}/ship`, method: 'post', data: payload })
  return mockShipOrder(id, payload)
}

/** 首页近期订单 */
export function getRecentOrders() {
  // return request({ url: '/biz/order/recent', method: 'get' })
  return mockGetRecentOrders()
}

/** 支付/发货状态枚举（前端常量） */
export { PAY_STATUS, SHIP_STATUS }
