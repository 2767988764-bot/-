/**
 * 用户模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'

/** 用户列表假数据（与设计稿用户管理表格一致） */
export const userList = [
  {
    id: 1,
    name: '陈志远',
    username: 'chenzhiyuan',
    phone: '13812345678',
    email: 'chenzhiyuan@wms.cn',
    role: '系统管理员',
    status: 1,
    createTime: '2026-01-06 09:12:00'
  },
  {
    id: 2,
    name: '林慧敏',
    username: 'linhuimin',
    phone: '13909876543',
    email: 'linhuimin@wms.cn',
    role: '总经理',
    status: 1,
    createTime: '2026-01-08 10:30:00'
  },
  {
    id: 3,
    name: '王建国',
    username: 'wangjianguo',
    phone: '13701234567',
    email: 'wangjianguo@wms.cn',
    role: '仓库管理员',
    status: 1,
    createTime: '2026-02-11 14:05:00'
  },
  {
    id: 4,
    name: '赵小雨',
    username: 'zhaoxiaoyu',
    phone: '13609871234',
    email: 'zhaoxiaoyu@wms.cn',
    role: '车间生产员',
    status: 1,
    createTime: '2026-02-19 16:42:00'
  },
  {
    id: 5,
    name: '孙立',
    username: 'sunli',
    phone: '13512349876',
    email: 'sunli@wms.cn',
    role: '仓库管理员',
    status: 0,
    createTime: '2026-03-02 11:18:00'
  },
  {
    id: 6,
    name: '周敏',
    username: 'zhoumin',
    phone: '13487651230',
    email: 'zhoumin@wms.cn',
    role: '车间生产员',
    status: 1,
    createTime: '2026-03-15 08:56:00'
  }
]

/** 可选角色（新增用户弹窗下拉项） */
export const roleOptions = ['系统管理员', '总经理', '仓库管理员', '车间生产员']

/** 当前登录态缓存，供 mockGetUserInfo 使用 */
let currentLoginUsername = localStorage.getItem('wms_login_username') || 'admin'

/** 用户列表查询：支持姓名/用户名关键字、角色、状态筛选 + 分页 */
export function mockGetUserList(params = {}) {
  const filtered = userList.filter(item => {
    const hitKeyword = like(item.name, params.keyword) || like(item.username, params.keyword)
    return hitKeyword && eq(item.role, params.role) && eq(item.status, params.status)
  })
  return reply(paginate(filtered, params))
}

/** 新增用户 */
export function mockAddUser(payload) {
  const row = {
    ...clone(payload),
    id: Date.now(),
    createTime: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  userList.push(row)
  return reply(row)
}

/** 修改用户 */
export function mockUpdateUser(payload) {
  const index = userList.findIndex(item => item.id === payload.id)
  if (index > -1) userList.splice(index, 1, { ...userList[index], ...clone(payload) })
  return reply(userList[index])
}

/** 删除用户 */
export function mockDeleteUser(id) {
  const index = userList.findIndex(item => item.id === id)
  if (index > -1) userList.splice(index, 1)
  return reply(true)
}

/** 启用 / 停用用户 */
export function mockToggleUserStatus(id, status) {
  const row = userList.find(item => item.id === id)
  if (row) row.status = status
  return reply(true)
}

/** 分配角色 */
export function mockAssignRoles(id, role) {
  const row = userList.find(item => item.id === id)
  if (row) row.role = role
  return reply(true)
}

/**
 * 登录
 * 演示用账号映射（改这里即可预览不同角色的菜单权限）：
 *   admin / 123456 → 系统管理员
 *   manager        → 总经理
 *   warehouse      → 仓库管理员
 *   worker         → 车间生产员
 */
export function mockLogin(form) {
  const roleMap = {
    admin: '系统管理员',
    manager: '总经理',
    warehouse: '仓库管理员',
    worker: '车间生产员'
  }
  const username = (form.username || 'admin').trim()
  currentLoginUsername = username
  localStorage.setItem('wms_login_username', username)
  return reply({
    token: 'mock-token-' + Date.now(),
    username,
    role: roleMap[username] || '系统管理员'
  })
}

/** 获取当前登录人信息 */
export function mockGetUserInfo() {
  const roleMap = {
    admin: '系统管理员',
    manager: '总经理',
    warehouse: '仓库管理员',
    worker: '车间生产员'
  }
  const nameMap = {
    admin: '陈志远',
    manager: '林慧敏',
    warehouse: '王建国',
    worker: '赵小雨'
  }
  const username = currentLoginUsername
  const role = roleMap[username] || '系统管理员'
  return reply({
    name: nameMap[username] || '陈志远',
    username,
    avatar: '',
    role,
    roles: [role],
    permissions: []
  })
}

/** 登出 */
export function mockLogout() {
  return reply(true)
}