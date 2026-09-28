/**
 * 通知 / 消息中心接口
 * ---------------------------------------------------------------
 * 说明：当前所有函数返回 src/mock/notification.js 中的本地假数据，
 *      函数内部已用注释标注真实请求写法。
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockGetNotifications,
  mockGetUnreadCount,
  mockMarkAsRead,
  mockMarkAllAsRead,
  mockDeleteNotification
} from '@/mock/notification'

/**
 * 查询通知列表（默认按时间倒序，默认返回最近 20 条）
 * @param {Object} [params]
 * @param {number} [params.type] 通知类型：1 系统 / 2 订单 / 3 入出库 / 4 权限 / 5 任务，不传返回全部
 * @param {number} [params.read] 0 未读 / 1 已读，不传返回全部
 * @param {number} [params.limit] 返回条数上限
 * @returns {Promise<{list: Array, total: number, unread: number}>}
 */
export function getNotifications(params) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/notification', method: 'get', params })
  return mockGetNotifications(params)
}

/**
 * 获取当前用户未读数量（用于 Header 铃铛 Badge）
 * @returns {Promise<{unread: number, total: number}>}
 */
export function getUnreadCount() {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/notification/unread', method: 'get' })
  return mockGetUnreadCount()
}

/**
 * 标记单条通知为已读
 * @param {number} id 通知 id
 * @returns {Promise<boolean>}
 */
export function markAsRead(id) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/notification/${id}/read`, method: 'patch' })
  return mockMarkAsRead(id)
}

/**
 * 标记全部通知为已读
 * @returns {Promise<{updated: number}>} updated: 本次标记已读条数
 */
export function markAllAsRead() {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/notification/read-all', method: 'post' })
  return mockMarkAllAsRead()
}

/**
 * 删除单条通知（逻辑删除）
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export function deleteNotification(id) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/notification/${id}`, method: 'delete' })
  return mockDeleteNotification(id)
}
