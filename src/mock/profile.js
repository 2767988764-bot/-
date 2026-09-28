/**
 * 个人中心 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { reply, clone } from './helper'

/** 当前登录人资料（与 mockGetUserInfo 保持一致） */
let profileData = {
  id: 1,
  name: '陈志远',
  username: 'admin',
  phone: '13812345678',
  email: 'chenzhiyuan@wms.cn',
  role: '系统管理员',
  avatar: ''
}

/** 获取当前登录人资料 */
export function mockGetProfile() {
  return reply(clone(profileData))
}

/** 更新个人资料（姓名、手机号、邮箱、头像） */
export function mockUpdateProfile(payload) {
  profileData = { ...profileData, ...clone(payload) }
  return reply(clone(profileData))
}

/**
 * 修改密码
 * 演示用：原密码固定为 123456
 */
export function mockChangePassword({ oldPassword, newPassword }) {
  if (oldPassword !== '123456') {
    return reply({ success: false, message: '原密码不正确' }, 300)
  }
  if (newPassword.length < 6) {
    return reply({ success: false, message: '新密码长度不能少于 6 位' }, 300)
  }
  return reply({ success: true, message: '密码修改成功，请重新登录' })
}
