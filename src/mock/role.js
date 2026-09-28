/**
 * 角色模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'

/** 预置角色（与设计稿角色列表一致：人数 3 / 2 / 8 / 16） */
export const roleList = [
  {
    id: 1,
    name: '系统管理员',
    description: '拥有系统全部功能权限，可管理用户、角色与权限配置',
    userCount: 3,
    status: 1,
    createTime: '2026-01-06 09:12:00'
  },
  {
    id: 2,
    name: '总经理',
    description: '查看全部业务数据与统计报表，不可修改系统配置',
    userCount: 2,
    status: 1,
    createTime: '2026-01-06 09:12:00'
  },
  {
    id: 3,
    name: '仓库管理员',
    description: '负责仓库资料、入库、出库与库存盘点操作',
    userCount: 8,
    status: 1,
    createTime: '2026-01-06 09:12:00'
  },
  {
    id: 4,
    name: '车间生产员',
    description: '负责生产线操作与生产进度上报',
    userCount: 16,
    status: 1,
    createTime: '2026-01-06 09:12:00'
  }
]

/** 权限树（角色分配权限弹窗使用，与左侧菜单一一对应） */
export const permissionTree = [
  { id: 1, label: '首页仪表盘', children: [] },
  { id: 2, label: '用户管理', children: [{ id: 21, label: '用户新增' }, { id: 22, label: '用户修改' }, { id: 23, label: '用户删除' }] },
  {
    id: 3,
    label: '角色权限',
    children: [
      { id: 31, label: '角色列表', children: [{ id: 311, label: '分配权限' }] },
      { id: 32, label: '权限列表' }
    ]
  },
  {
    id: 4,
    label: '订单管理',
    children: [{ id: 41, label: '新建订单' }, { id: 42, label: '修改订单' }, { id: 43, label: '发货' }, { id: 44, label: '删除订单' }]
  },
  {
    id: 5,
    label: '生产管理',
    children: [
      { id: 51, label: '我的生产', children: [{ id: 511, label: '开始生产' }, { id: 512, label: '完成生产' }] },
      { id: 52, label: '生产档案', children: [{ id: 521, label: '入库' }, { id: 522, label: '标记完成' }] }
    ]
  },
  {
    id: 6,
    label: '仓库管理',
    children: [
      { id: 61, label: '我的仓库' },
      { id: 62, label: '入库管理', children: [{ id: 621, label: '入库登记' }] },
      { id: 63, label: '出库管理', children: [{ id: 631, label: '出库' }] },
      { id: 64, label: '仓库盘点' }
    ]
  },
  { id: 7, label: '发货管理', children: [{ id: 71, label: '确认发货' }] },
  { id: 8, label: '基础数据', children: [{ id: 81, label: '客户列表' }, { id: 82, label: '仓库资料' }] },
  { id: 9, label: '报表统计', children: [{ id: 91, label: '导出台账' }] },
  { id: 10, label: '系统监控', children: [{ id: 101, label: '在线用户' }, { id: 102, label: '操作日志' }] }
]

/** 角色已勾选的权限 id（演示数据） */
export const rolePermissionMap = {
  1: [1, 2, 21, 22, 23, 3, 31, 311, 32, 4, 41, 42, 43, 44, 5, 51, 511, 512, 52, 521, 522, 6, 61, 62, 621, 63, 631, 64, 7, 71, 8, 81, 82, 9, 91, 10, 101, 102],
  2: [1, 2, 3, 31, 32, 4, 5, 51, 52, 6, 61, 62, 63, 7, 8, 81, 82, 9],
  3: [1, 4, 5, 52, 6, 61, 62, 621, 63, 631, 64, 8, 81, 82],
  4: [1, 5, 51, 511, 512, 6, 61, 62, 621]
}

/** 角色列表查询 */
export function mockGetRoleList(params = {}) {
  const filtered = roleList.filter(item => like(item.name, params.keyword) && eq(item.status, params.status))
  return reply(paginate(filtered, params))
}

/** 角色下拉选项 */
export function mockGetRoleOptions() {
  return reply(clone(roleList.map(item => ({ id: item.id, name: item.name }))))
}

/** 新增角色 */
export function mockAddRole(payload) {
  const row = {
    ...clone(payload),
    id: Date.now(),
    userCount: 0,
    status: payload.status === undefined ? 1 : payload.status,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  roleList.push(row)
  return reply(row)
}

/** 修改角色 */
export function mockUpdateRole(payload) {
  const index = roleList.findIndex(item => item.id === payload.id)
  if (index > -1) roleList.splice(index, 1, { ...roleList[index], ...clone(payload) })
  return reply(roleList[index])
}

/** 删除角色 */
export function mockDeleteRole(id) {
  const index = roleList.findIndex(item => item.id === id)
  if (index > -1) roleList.splice(index, 1)
  return reply(true)
}

/** 获取角色的权限树勾选状态 */
export function mockGetRolePermissions(roleId) {
  return reply({
    tree: clone(permissionTree),
    checkedKeys: clone(rolePermissionMap[roleId] || [])
  })
}

/** 保存角色权限 */
export function mockSaveRolePermissions(roleId, checkedKeys) {
  rolePermissionMap[roleId] = clone(checkedKeys || [])
  return reply(true)
}