/**
 * 权限管理接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockAddPermission,
  mockDeletePermission,
  mockGetPermissionList,
  mockTogglePermissionStatus,
  mockUpdatePermission,
  PERMISSION_LEVELS
} from '@/mock/permission'

/**
 * 分页查询权限列表
 * @param {Object} params
 * @param {string} [params.keyword]  权限名称关键字
 * @param {string} [params.level]    权限级别：目录 | 菜单 | 按钮
 * @param {number} [params.status]   状态 1 启用 / 0 停用
 * @param {number} [params.page]     页码
 * @param {number} [params.pageSize] 每页条数
 * @returns {Promise<{list: Array, total: number}>}
 *          list[].{ id, name, path, level, sort, status, parentId }
 */
export function getPermissionList(params) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/permission/list', method: 'get', params })
  return mockGetPermissionList(params)
}

/**
 * 权限级别选项
 * @returns {Array<string>} ['目录', '菜单', '按钮']
 */
export function getPermissionLevels() {
  return PERMISSION_LEVELS
}

/**
 * 新增权限
 * @param {Object} data
 * @param {string} data.name     权限名称
 * @param {string} data.path     路由路径
 * @param {string} data.level    权限级别
 * @param {number} data.sort     排序
 * @param {number} [data.status] 状态
 * @returns {Promise<Object>}
 */
export function addPermission(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/permission', method: 'post', data })
  return mockAddPermission(data)
}

/**
 * 修改权限
 * @param {Object} data 同新增，必须携带 id
 * @returns {Promise<Object>}
 */
export function updatePermission(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/permission/${data.id}`, method: 'put', data })
  return mockUpdatePermission(data)
}

/**
 * 删除权限
 * @param {number} id 权限 id
 * @returns {Promise<boolean>}
 */
export function deletePermission(id) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/permission/${id}`, method: 'delete' })
  return mockDeletePermission(id)
}

/**
 * 切换菜单启用 / 停用
 * @param {number} id     权限 id
 * @param {number} status 1 启用 / 0 停用
 * @returns {Promise<boolean>}
 */
export function togglePermissionStatus(id, status) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/permission/${id}/status`, method: 'patch', data: { status } })
  return mockTogglePermissionStatus(id, status)
}