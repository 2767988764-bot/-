/**
 * 系统监控接口
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockForceLogout,
  mockGetOnlineUsers,
  mockGetOperationLogs
} from '@/mock/monitor'

/** 在线用户列表 */
export function getOnlineUsers(params) {
  // return request({ url: '/monitor/online/list', method: 'get', params })
  return mockGetOnlineUsers(params)
}

/** 操作日志列表 */
export function getOperationLogs(params) {
  // return request({ url: '/monitor/log/list', method: 'get', params })
  return mockGetOperationLogs(params)
}

/** 强制下线 */
export function forceLogout(id) {
  // return request({ url: `/monitor/online/${id}/force-logout`, method: 'post' })
  return mockForceLogout(id)
}
