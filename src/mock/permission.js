/**
 * 权限模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'

/** 权限级别枚举 */
export const PERMISSION_LEVELS = ['目录', '菜单', '按钮']

/**
 * 权限列表假数据
 * level：目录 / 菜单 / 按钮；status：1 启用 / 0 停用
 */
export const permissionList = [
  { id: 1, name: '首页仪表盘', path: '/dashboard', level: '菜单', sort: 1, status: 1, parentId: 0 },
  { id: 2, name: '用户管理', path: '/user', level: '菜单', sort: 2, status: 1, parentId: 0 },
  { id: 3, name: '用户新增', path: '/user/add', level: '按钮', sort: 3, status: 1, parentId: 2 },
  { id: 4, name: '用户删除', path: '/user/delete', level: '按钮', sort: 4, status: 0, parentId: 2 },
  { id: 5, name: '角色权限', path: '/permission', level: '目录', sort: 5, status: 1, parentId: 0 },
  { id: 6, name: '角色列表', path: '/permission/role', level: '菜单', sort: 6, status: 1, parentId: 5 },
  { id: 7, name: '权限列表', path: '/permission/list', level: '菜单', sort: 7, status: 1, parentId: 5 },
  { id: 8, name: '订单管理', path: '/order', level: '菜单', sort: 8, status: 1, parentId: 0 },
  { id: 9, name: '生产管理', path: '/production', level: '目录', sort: 9, status: 1, parentId: 0 },
  { id: 10, name: '我的生产', path: '/production/line', level: '菜单', sort: 10, status: 1, parentId: 9 },
  { id: 11, name: '生产档案', path: '/production/record', level: '菜单', sort: 11, status: 1, parentId: 9 },
  { id: 12, name: '仓库管理', path: '/warehouse', level: '目录', sort: 12, status: 1, parentId: 0 },
  { id: 13, name: '我的仓库', path: '/warehouse/mine', level: '菜单', sort: 13, status: 1, parentId: 12 },
  { id: 14, name: '入库管理', path: '/warehouse/in', level: '菜单', sort: 14, status: 1, parentId: 12 },
  { id: 15, name: '出库管理', path: '/warehouse/out', level: '菜单', sort: 15, status: 1, parentId: 12 },
  { id: 16, name: '仓库盘点', path: '/warehouse/check', level: '菜单', sort: 16, status: 1, parentId: 12 },
  { id: 17, name: '发货管理', path: '/shipping', level: '菜单', sort: 17, status: 1, parentId: 0 },
  { id: 18, name: '基础数据', path: '/base', level: '目录', sort: 18, status: 1, parentId: 0 },
  { id: 19, name: '客户列表', path: '/base/customer', level: '菜单', sort: 19, status: 1, parentId: 18 },
  { id: 20, name: '仓库资料', path: '/base/warehouse', level: '菜单', sort: 20, status: 1, parentId: 18 },
  { id: 21, name: '报表统计', path: '/statistics', level: '菜单', sort: 21, status: 1, parentId: 0 },
  { id: 22, name: '系统监控', path: '/monitor', level: '目录', sort: 22, status: 1, parentId: 0 },
  { id: 23, name: '在线用户', path: '/monitor/online', level: '菜单', sort: 23, status: 1, parentId: 22 },
  { id: 24, name: '操作日志', path: '/monitor/log', level: '菜单', sort: 24, status: 1, parentId: 22 }
]

/** 权限列表查询：支持名称关键字、级别、状态筛选 + 分页 */
export function mockGetPermissionList(params = {}) {
  const filtered = permissionList.filter(
    item => like(item.name, params.keyword) && eq(item.level, params.level) && eq(item.status, params.status)
  )
  return reply(paginate(filtered, params))
}

/** 新增权限 */
export function mockAddPermission(payload) {
  const row = {
    ...clone(payload),
    id: Date.now(),
    status: payload.status === undefined ? 1 : payload.status
  }
  permissionList.push(row)
  return reply(row)
}

/** 修改权限 */
export function mockUpdatePermission(payload) {
  const index = permissionList.findIndex(item => item.id === payload.id)
  if (index > -1) permissionList.splice(index, 1, { ...permissionList[index], ...clone(payload) })
  return reply(permissionList[index])
}

/** 删除权限 */
export function mockDeletePermission(id) {
  const index = permissionList.findIndex(item => item.id === id)
  if (index > -1) permissionList.splice(index, 1)
  return reply(true)
}

/** 切换菜单启用 / 停用 */
export function mockTogglePermissionStatus(id, status) {
  const row = permissionList.find(item => item.id === id)
  if (row) row.status = status
  return reply(true)
}