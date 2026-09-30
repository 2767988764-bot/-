/**
 * 订单管理接口（已对接真实后端，对齐 后端对接说明.md 3.5）
 * 状态枚举严格按 4.1；订单编号由后端自动生成（4.2）。
 */
import request from '@/utils/request'

/** 支付状态枚举（严格按 4.1） */
export const PAY_STATUS = { PAID: '已付款', UNPAID: '未付款' }

/** 发货状态枚举（严格按 4.1） */
export const SHIP_STATUS = { SHIPPED: '已发货', UNSHIPPED: '未发货' }

/** 客户名称池（新增表单下拉选项，非订单数据） */
export const CUSTOMERS = [
  '杭州云仓商贸',
  '苏州恒达物流',
  '宁波港城贸易',
  '无锡鑫源五金',
  '合肥新宇电子',
  '上海联创家居'
]

/** 商品名称池（新增表单下拉选项，非订单数据） */
export const PRODUCTS = ['精密轴承套件', '不锈钢法兰盘', '液压缸体', '铝合金支架', '齿轮箱总成', '工业传送带']

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
  return request({ url: '/biz/order/list', method: 'get', params })
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
  return request({ url: '/biz/order', method: 'post', data })
}

/** 修改订单 */
export function updateOrder(data) {
  return request({ url: `/biz/order/${data.id}`, method: 'put', data })
}

/** 删除订单（后端逻辑删除） */
export function deleteOrder(id) {
  return request({ url: `/biz/order/${id}`, method: 'delete' })
}

/** 标记支付状态 */
export function updatePayStatus(id, payStatus) {
  return request({ url: `/biz/order/${id}/pay`, method: 'patch', data: { payStatus } })
}

/** 发货操作（成功后端回写 shipStatus=已发货） */
export function shipOrder(id, payload) {
  return request({ url: `/biz/order/${id}/ship`, method: 'post', data: payload })
}