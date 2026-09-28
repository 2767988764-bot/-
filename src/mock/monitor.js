/**
 * 系统监控 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, like, eq, paginate, reply } from './helper'

/** 在线用户假数据 */
const onlineUsers = [
  { id: 1, user: '陈志远', role: '系统管理员', ip: '192.168.1.100', loginTime: '2026-09-28 08:12:00', status: '在线' },
  { id: 2, user: '林慧敏', role: '总经理', ip: '192.168.1.108', loginTime: '2026-09-28 08:25:00', status: '在线' },
  { id: 3, user: '王建国', role: '仓库管理员', ip: '192.168.1.115', loginTime: '2026-09-28 08:40:00', status: '在线' },
  { id: 4, user: '赵小雨', role: '车间生产员', ip: '192.168.1.122', loginTime: '2026-09-28 09:05:00', status: '在线' },
  { id: 5, user: '周敏', role: '车间生产员', ip: '192.168.1.125', loginTime: '2026-09-28 09:18:00', status: '在线' },
  { id: 6, user: '孙立', role: '仓库管理员', ip: '192.168.1.130', loginTime: '2026-09-27 17:30:00', status: '离线' }
]

/** 操作日志假数据 */
const operationLogs = [
  { id: 1, time: '2026-09-28 10:23:15', user: '陈志远', operation: '新增用户「赵小雨」', ip: '192.168.1.100', result: '成功' },
  { id: 2, time: '2026-09-28 09:45:30', user: '王建国', operation: '入库登记 G20260928001', ip: '192.168.1.115', result: '成功' },
  { id: 3, time: '2026-09-28 09:30:12', user: '林慧敏', operation: '查看订单列表', ip: '192.168.1.108', result: '成功' },
  { id: 4, time: '2026-09-28 09:15:08', user: '赵小雨', operation: '开始生产 一号生产线', ip: '192.168.1.122', result: '成功' },
  { id: 5, time: '2026-09-28 08:50:45', user: '王建国', operation: '出库操作 G20260927001', ip: '192.168.1.115', result: '成功' },
  { id: 6, time: '2026-09-28 08:30:22', user: '陈志远', operation: '修改角色权限「仓库管理员」', ip: '192.168.1.100', result: '成功' },
  { id: 7, time: '2026-09-28 08:15:10', user: '周敏', operation: '删除生产档案 PO-20260920-005', ip: '192.168.1.125', result: '失败：权限不足' },
  { id: 8, time: '2026-09-27 17:45:33', user: '林慧敏', operation: '导出出入库台账', ip: '192.168.1.108', result: '成功' }
]

export function mockGetOnlineUsers(params = {}) {
  const filtered = onlineUsers.filter(item => like(item.user, params.keyword) || like(item.role, params.keyword))
  return reply(paginate(filtered, params))
}

export function mockGetOperationLogs(params = {}) {
  const filtered = operationLogs.filter(item => {
    const hitKeyword = like(item.user, params.keyword) || like(item.operation, params.keyword)
    return hitKeyword && eq(item.result, params.result)
  })
  return reply(paginate(filtered, params))
}

export function mockForceLogout(id) {
  const row = onlineUsers.find(item => item.id === id)
  if (row) row.status = '离线'
  return reply(true)
}