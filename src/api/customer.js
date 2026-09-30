/**
 * 客户管理接口
 */
import request from '@/utils/request'

/** 客户列表（分页） */
export function getCustomerList(params) {
  return request({ url: '/biz/customer/list', method: 'get', params })
}

/** 新增客户 */
export function addCustomer(data) {
  return request({ url: '/biz/customer', method: 'post', data })
}

/** 修改客户 */
export function updateCustomer(data) {
  return request({ url: `/biz/customer/${data.id}`, method: 'put', data })
}

/** 删除客户 */
export function deleteCustomer(id) {
  return request({ url: `/biz/customer/${id}`, method: 'delete' })
}

/** 加入/移出黑名单 */
export function toggleBlacklist(id, status) {
  return request({ url: `/biz/customer/${id}/blacklist`, method: 'patch', data: { status } })
}