/**
 * 角色管理接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockAddRole,
  mockDeleteRole,
  mockGetRoleList,
  mockGetRoleOptions,
  mockGetRolePermissions,
  mockSaveRolePermissions,
  mockUpdateRole
} from '@/mock/role'

/**
 * 分页查询角色列表
 * @param {Object} params
 * @param {string} [params.keyword]  角色名称关键字
 * @param {number} [params.status]   状态 1 启用 / 0 停用
 * @param {number} [params.page]     页码
 * @param {number} [params.pageSize] 每页条数
 * @returns {Promise<{list: Array, total: number}>}
 *          list[].{ id, name, description, userCount, status, createTime }
 */
export function getRoleList(params) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/role/list', method: 'get', params })
  return mockGetRoleList(params)
}

/**
 * 角色下拉选项
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export function getRoleOptions() {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/role/options', method: 'get' })
  return mockGetRoleOptions()
}

/**
 * 新增角色
 * @param {Object} data
 * @param {string} data.name        角色名称
 * @param {string} data.description 角色描述
 * @param {number} [data.status]    状态
 * @returns {Promise<Object>}
 */
export function addRole(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/role', method: 'post', data })
  return mockAddRole(data)
}

/**
 * 修改角色
 * @param {Object} data 同新增，必须携带 id
 * @returns {Promise<Object>}
 */
export function updateRole(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/role/${data.id}`, method: 'put', data })
  return mockUpdateRole(data)
}

/**
 * 删除角色
 * @param {number} id 角色 id
 * @returns {Promise<boolean>}
 */
export function deleteRole(id) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/role/${id}`, method: 'delete' })
  return mockDeleteRole(id)
}

/**
 * 获取角色已分配的权限（菜单树 + 勾选节点）
 * @param {number} roleId 角色 id
 * @returns {Promise<{tree: Array, checkedKeys: Array<number>}>}
 *          tree[].{ id, label, children } —— 树节点字段由 el-tree 直接消费
 */
export function getRolePermissions(roleId) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/role/${roleId}/permissions`, method: 'get' })
  return mockGetRolePermissions(roleId)
}

/**
 * 保存角色权限分配
 * @param {number} roleId           角色 id
 * @param {Array<number>} checkedKeys 勾选的权限 id 集合
 * @returns {Promise<boolean>}
 */
export function saveRolePermissions(roleId, checkedKeys) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/role/${roleId}/permissions`, method: 'put', data: { checkedKeys } })
  return mockSaveRolePermissions(roleId, checkedKeys)
}