/**
 * 发货管理接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockConfirmShipping,
  mockDeleteShipping,
  mockGetShippingList,
  LOGISTICS_COMPANIES,
  SHIP_ORDER_STATUS
} from '@/mock/shipping'

/** 发货单列表（分页） */
export function getShippingList(params) {
  // return request({ url: '/biz/shipping/list', method: 'get', params })
  return mockGetShippingList(params)
}

/** 确认发货 */
export function confirmShipping(id, data) {
  // return request({ url: `/biz/shipping/${id}/confirm`, method: 'post', data })
  return mockConfirmShipping(id, data)
}

/** 删除发货单 */
export function deleteShipping(id) {
  // return request({ url: `/biz/shipping/${id}`, method: 'delete' })
  return mockDeleteShipping(id)
}

export { LOGISTICS_COMPANIES, SHIP_ORDER_STATUS }
