/**
 * 通知 / 消息中心 mock 数据
 * ---------------------------------------------------------------
 * 仅服务于 src/api/notification.js 的本地假数据。
 * 【后端接口就绪后，整个 mock 目录可直接删除】
 */
import { reply, clone } from './helper'

/** 通知类型：1 系统 2 订单 3 入出库 4 权限 5 任务 */
export const notificationTypeMap = {
  1: { label: '系统', color: 'info' },
  2: { label: '订单', color: 'brand' },
  3: { label: '入出库', color: 'ok' },
  4: { label: '权限', color: 'warn' },
  5: { label: '任务', color: 'neutral' }
}

/** 通知列表（25 条，覆盖已读 / 未读、不同类型与时间） */
const notifications = [
  { id: 1, type: 1, title: '系统将于今晚 23:00 进行例行维护', content: '维护期间系统将暂停访问，预计耗时 30 分钟，请提前保存工作内容。', time: '2026-09-28 14:32', read: false },
  { id: 2, type: 2, title: '订单 #DD20260928012 已创建', content: '客户「华北商贸」提交了一笔新订单，金额 ¥18,500，请尽快审核。', time: '2026-09-28 13:58', read: false },
  { id: 3, type: 3, title: '入库单 RK20260928005 待验收', content: '原料仓 A-03 区 120 件耗材已到货，等待仓库管理员验收。', time: '2026-09-28 11:20', read: false },
  { id: 4, type: 4, title: '您的角色权限已更新', content: '系统管理员已将您的角色调整为「仓库管理员」，新增仓库管理相关权限。', time: '2026-09-28 10:05', read: false },
  { id: 5, type: 5, title: '今日盘点任务待处理', content: '您有 3 个待完成的盘点任务，截止时间今日 18:00，请及时处理。', time: '2026-09-28 09:30', read: false },
  { id: 6, type: 2, title: '订单 #DD20260927089 已完成发货', content: '客户「华南物流」订单已于 14:20 完成出库，物流单号 SF1234567890。', time: '2026-09-27 14:22', read: true },
  { id: 7, type: 3, title: '出库单 CK20260927034 已完成', content: '成品仓 B-07 区 80 件产品已出库，剩余库存 1,250 件。', time: '2026-09-27 16:45', read: true },
  { id: 8, type: 1, title: '密码安全提醒', content: '您的密码已 90 天未更新，建议尽快修改以保障账号安全。', time: '2026-09-27 09:00', read: true },
  { id: 9, type: 4, title: '新增用户「李明」已激活', content: '车间生产员账号已创建完成，初始密码已通过短信发送。', time: '2026-09-26 17:30', read: true },
  { id: 10, type: 5, title: '周度库存盘点报告已生成', content: '本周共完成 12 次盘点，盘盈 3 次，盘亏 1 次，详情请查看报表。', time: '2026-09-26 10:00', read: true },
  { id: 11, type: 2, title: '订单 #DD20260925067 待审核超时', content: '该订单已超过 24 小时未审核，请尽快处理。', time: '2026-09-26 08:30', read: false },
  { id: 12, type: 3, title: '入库单 RK20260925021 验收异常', content: 'A-02 区到货数量与订单不符，实收 95 件，应收 100 件。', time: '2026-09-25 15:18', read: false },
  { id: 13, type: 1, title: '数据字典新增「产品状态」分类', content: '系统管理员新增字典分类「产品状态」，包含 6 个字典项。', time: '2026-09-25 11:00', read: true },
  { id: 14, type: 4, title: '角色「车间生产员」权限已调整', content: '新增「生产管理」模块访问权限，移除「报表统计」查看权限。', time: '2026-09-25 09:15', read: true },
  { id: 15, type: 5, title: '月度库存报表已生成', content: '9 月份库存月报已生成，平均周转天数 8.5 天，环比下降 12%。', time: '2026-09-24 18:00', read: true },
  { id: 16, type: 2, title: '订单 #DD20260924031 已完成', content: '客户「华东供应链」订单已签收，物流状态：已送达。', time: '2026-09-24 16:30', read: true },
  { id: 17, type: 3, title: '仓库「原料仓」库存预警', content: 'A-03 区耗材库存低于安全阈值，当前 80 件，安全库存 150 件。', time: '2026-09-24 14:00', read: false },
  { id: 18, type: 1, title: '系统日志清理完成', content: '已清理 30 天前的系统日志，释放存储空间 2.3 GB。', time: '2026-09-24 03:00', read: true },
  { id: 19, type: 5, title: '盘点任务「PD20260923004」已完成', content: 'B-05 区盘点完成，实盘 1,250 件，账实一致。', time: '2026-09-23 17:45', read: true },
  { id: 20, type: 4, title: '用户「王芳」账号已停用', content: '该用户已离职，账号已停用，相关权限已回收。', time: '2026-09-23 10:20', read: true },
  { id: 21, type: 2, title: '订单 #DD20260922018 已取消', content: '客户「华北商贸」取消订单，原因为「客户改单」。', time: '2026-09-22 14:10', read: true },
  { id: 22, type: 3, title: '出库单 CK20260922009 创建成功', content: 'B-07 区 60 件产品已申请出库，等待审核。', time: '2026-09-22 11:30', read: true },
  { id: 23, type: 1, title: '系统版本更新到 v1.4.0', content: '本次更新包含 3 项功能优化、5 个问题修复，详情查看更新日志。', time: '2026-09-22 09:00', read: true },
  { id: 24, type: 5, title: '任务逾期提醒', content: '盘点任务「PD20260920002」已逾期 2 天，请尽快处理。', time: '2026-09-21 08:00', read: false },
  { id: 25, type: 2, title: '订单 #DD20260920045 已退款', content: '客户「华南物流」订单退款已处理，金额 ¥6,800。', time: '2026-09-20 16:30', read: true }
]

/**
 * 查询通知列表
 * @param {Object} params
 * @param {number} [params.type]   通知类型：1 系统 / 2 订单 / 3 入出库 / 4 权限 / 5 任务，不传返回全部
 * @param {number} [params.read]   0 未读 / 1 已读，不传返回全部
 * @param {number} [params.limit]   返回条数上限，默认 20
 * @returns {Promise<{list: Array, total: number, unread: number}>}
 *          list[].{ id, type, title, content, time, read }
 *          unread：未读总数
 */
export function mockGetNotifications(params = {}) {
  let list = clone(notifications)
  if (params.type !== undefined && params.type !== '' && params.type !== null) {
    list = list.filter(n => Number(n.type) === Number(params.type))
  }
  if (params.read !== undefined && params.read !== '' && params.read !== null) {
    list = list.filter(n => Number(n.read) === Number(params.read))
  }
  // 时间倒序
  list.sort((a, b) => (a.time < b.time ? 1 : -1))
  const limit = Number(params.limit) || 20
  const sliced = list.slice(0, limit)
  const unread = notifications.filter(n => !n.read).length
  return reply({ list: sliced, total: list.length, unread })
}

/**
 * 获取未读数量
 * @returns {Promise<{unread: number, total: number}>}
 */
export function mockGetUnreadCount() {
  return reply({
    unread: notifications.filter(n => !n.read).length,
    total: notifications.length
  })
}

/**
 * 标记单条为已读
 * @param {number} id 通知 id
 * @returns {Promise<boolean>}
 */
export function mockMarkAsRead(id) {
  const item = notifications.find(n => n.id === Number(id))
  if (item) item.read = true
  return reply(true)
}

/**
 * 标记全部为已读
 * @returns {Promise<{updated: number}>}
 */
export function mockMarkAllAsRead() {
  let updated = 0
  notifications.forEach(n => {
    if (!n.read) {
      n.read = true
      updated++
    }
  })
  return reply({ updated })
}

/**
 * 删除单条通知（逻辑删除，仅 mock 演示）
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export function mockDeleteNotification(id) {
  const idx = notifications.findIndex(n => n.id === Number(id))
  if (idx > -1) notifications.splice(idx, 1)
  return reply(true)
}
