/**
 * 用户管理接口
 * ---------------------------------------------------------------
 * 说明：当前所有函数返回 src/mock/user.js 中的本地假数据，
 *      函数内部已用注释标注真实请求写法。
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockAddUser,
  mockAssignRoles,
  mockDeleteUser,
  mockGetUserList,
  mockToggleUserStatus,
  mockUpdateUser,
  roleOptions
} from '@/mock/user'

/**
 * 分页查询用户列表
 * @param {Object} params 查询参数
 * @param {string} [params.keyword]  姓名 / 用户名关键字（模糊）
 * @param {string} [params.role]     角色：系统管理员 | 总经理 | 仓库管理员 | 车间生产员
 * @param {number} [params.status]   状态：1 启用 / 0 停用
 * @param {number} [params.page]     页码，从 1 开始
 * @param {number} [params.pageSize] 每页条数
 * @returns {Promise<{list: Array, total: number, page: number, pageSize: number}>}
 *          list[].{ id, name, username, phone, email, role, status, createTime }
 */
export function getUserList(params) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/user/list', method: 'get', params })
  return mockGetUserList(params)
}

/**
 * 新增用户
 * @param {Object} data
 * @param {string} data.name     姓名
 * @param {string} data.username 登录账号
 * @param {string} data.phone    手机号
 * @param {string} data.email    邮箱
 * @param {string} data.role     角色
 * @param {number} data.status   状态 1 启用 / 0 停用
 * @returns {Promise<Object>} 新增后的用户对象（含后端生成的 id、createTime）
 */
export function addUser(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/user', method: 'post', data })
  return mockAddUser(data)
}

/**
 * 修改用户
 * @param {Object} data 同新增，必须携带 id
 * @returns {Promise<Object>} 修改后的用户对象
 */
export function updateUser(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/user/${data.id}`, method: 'put', data })
  return mockUpdateUser(data)
}

/**
 * 删除用户（MVP 后端为逻辑删除）
 * @param {number} id 用户 id
 * @returns {Promise<boolean>}
 */
export function deleteUser(id) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/user/${id}`, method: 'delete' })
  return mockDeleteUser(id)
}

/**
 * 启用 / 停用用户
 * @param {number} id     用户 id
 * @param {number} status 1 启用 / 0 停用
 * @returns {Promise<boolean>}
 */
export function toggleUserStatus(id, status) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/user/${id}/status`, method: 'patch', data: { status } })
  return mockToggleUserStatus(id, status)
}

/**
 * 分配角色
 * @param {number} id   用户 id
 * @param {string} role 角色名称
 * @returns {Promise<boolean>}
 */
export function assignRoles(id, role) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/user/${id}/role`, method: 'put', data: { role } })
  return mockAssignRoles(id, role)
}

/**
 * 角色下拉选项（表单用）
 * @returns {Array<string>}
 */
export function getUserRoleOptions() {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/role/options', method: 'get' })
  return roleOptions
}

/**
 * 登录
 * @param {Object} data
 * @param {string} data.username 登录账号
 * @param {string} data.password 密码
 * @returns {Promise<{token: string, username: string, role: string}>}
 */
export function login(data) {
  // 真实请求：POST /auth/login，前置代理 /api → 后端 9090
  return request({ url: '/auth/login', method: 'post', data })
}

/**
 * 获取当前登录人信息
 * @returns {Promise<{name: string, username: string, avatar: string, role: string, roles: Array<string>, permissions: Array<string>}>}
 */
export function getUserInfo() {
  // 真实请求：GET /auth/info，返回 { name, username, avatar, role, permissions }
  return request({ url: '/auth/info', method: 'get' })
}

/**
 * 退出登录
 * @returns {Promise<boolean>}
 */
export function logout() {
  // 真实请求：POST /auth/logout
  return request({ url: '/auth/logout', method: 'post' })
}