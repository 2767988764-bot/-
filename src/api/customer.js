/**
 * 客户管理接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockAddCustomer,
  mockDeleteCustomer,
  mockGetCustomerList,
  mockGetCustomerOptions,
  mockToggleBlacklist,
  mockUpdateCustomer,
  CUSTOMER_STATUS
} from '@/mock/customer'

/** 客户列表（分页） */
export function getCustomerList(params) {
  // return request({ url: '/biz/customer/list', method: 'get', params })
  return mockGetCustomerList(params)
}

/** 客户下拉选项 */
export function getCustomerOptions() {
  // return request({ url: '/biz/customer/options', method: 'get' })
  return mockGetCustomerOptions()
}

/** 新增客户 */
export function addCustomer(data) {
  // return request({ url: '/biz/customer', method: 'post', data })
  return mockAddCustomer(data)
}

/** 修改客户 */
export function updateCustomer(data) {
  // return request({ url: `/biz/customer/${data.id}`, method: 'put', data })
  return mockUpdateCustomer(data)
}

/** 删除客户 */
export function deleteCustomer(id) {
  // return request({ url: `/biz/customer/${id}`, method: 'delete' })
  return mockDeleteCustomer(id)
}

/** 加入/移出黑名单 */
export function toggleBlacklist(id, status) {
  // return request({ url: `/biz/customer/${id}/blacklist`, method: 'patch', data: { status } })
  return mockToggleBlacklist(id, status)
}

export { CUSTOMER_STATUS }
