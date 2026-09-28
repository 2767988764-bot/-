/**
 * 个人中心接口
 * ---------------------------------------------------------------
 * 说明：当前所有函数返回 src/mock/profile.js 中的本地假数据，
 *      函数内部已用注释标注真实请求写法。
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockGetProfile,
  mockUpdateProfile,
  mockChangePassword
} from '@/mock/profile'

/**
 * 获取当前登录人个人资料
 * @returns {Promise<{
 *   id: number,
 *   username: string,      // 登录账号（只读）
 *   role: string,          // 角色（只读）
 *   name: string,          // 姓名（可编辑）
 *   phone: string,         // 手机号（可编辑）
 *   email: string,         // 邮箱（可编辑）
 *   avatar: string,        // 头像 URL（占位）
 *   dept: string,          // 所属部门（只读，后端可扩展）
 *   createTime: string     // 账号创建时间（只读）
 * }>}
 */
export function getProfile() {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/profile', method: 'get' })
  return mockGetProfile()
}

/**
 * 修改个人资料（不含密码）
 * @param {Object} data
 * @param {string} data.name   姓名
 * @param {string} data.phone  手机号
 * @param {string} data.email  邮箱
 * @param {string} [data.avatar] 头像 URL（上传后回填）
 * @returns {Promise<Object>} 修改后的用户对象
 */
export function updateProfile(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/profile', method: 'put', data })
  return mockUpdateProfile(data)
}

/**
 * 修改登录密码
 * @param {Object} data
 * @param {string} data.oldPassword 原密码
 * @param {string} data.newPassword 新密码
 * @returns {Promise<{success: boolean, message: string}>} success=true 表示修改成功
 *          后端业务逻辑：原密码校验失败 → success=false
 */
export function changePassword(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/profile/password', method: 'put', data })
  return mockChangePassword(data)
}
