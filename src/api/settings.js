/**
 * 系统设置接口
 * ---------------------------------------------------------------
 * 说明：当前所有函数返回 src/mock/settings.js 中的本地假数据，
 *      函数内部已用注释标注真实请求写法。
 * 【后端接口就绪后，替换此处为真实axios请求】
 */
import request from '@/utils/request'
import {
  mockGetSystemConfig,
  mockUpdateSystemConfig,
  mockGetDictCategories,
  mockGetDictItems,
  mockAddDictCategory,
  mockUpdateDictCategory,
  mockToggleDictCategoryStatus,
  mockAddDictItem,
  mockUpdateDictItem,
  mockToggleDictItemStatus
} from '@/mock/settings'

/**
 * 获取系统基础配置
 * @returns {Promise<{
 *   systemName: string,         // 系统名称
 *   logoUrl: string,            // 系统 Logo（占位 URL）
 *   orderNoRule: string,        // 订单编号生成规则
 *   inboundNoRule: string,     // 入库货号生成规则
 *   defaultInboundArea: number, // 入库默认占用面积（㎡）
 *   updatedAt: string,          // 最近修改时间
 *   updatedBy: string           // 最近修改人
 * }>}
 */
export function getSystemConfig() {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/config', method: 'get' })
  return mockGetSystemConfig()
}

/**
 * 修改系统基础配置
 * @param {Object} data 同 getSystemConfig 返回结构
 * @returns {Promise<Object>} 修改后的配置对象
 */
export function updateSystemConfig(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/config', method: 'put', data })
  return mockUpdateSystemConfig(data)
}

/* ---------------- 数据字典 - 分类 ---------------- */

/**
 * 查询字典分类列表
 * @returns {Promise<Array<{
 *   id: number, code: string, name: string, description: string, status: number
 * }>>} status: 1 启用 / 0 停用
 */
export function getDictCategories() {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/dict/category', method: 'get' })
  return mockGetDictCategories()
}

/**
 * 新增字典分类
 * @param {Object} data
 * @param {string} data.code        分类编码（唯一）
 * @param {string} data.name        分类名称
 * @param {string} [data.description] 描述
 * @returns {Promise<Object>} 新增后的分类对象（含后端生成 id）
 */
export function addDictCategory(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/dict/category', method: 'post', data })
  return mockAddDictCategory(data)
}

/**
 * 修改字典分类
 * @param {Object} data 必须包含 id
 * @returns {Promise<Object>} 修改后的分类对象
 */
export function updateDictCategory(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/dict/category/${data.id}`, method: 'put', data })
  return mockUpdateDictCategory(data)
}

/**
 * 启用 / 停用字典分类
 * @param {number} id     分类 id
 * @param {number} status 1 启用 / 0 停用
 * @returns {Promise<boolean>}
 */
export function toggleDictCategoryStatus(id, status) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/dict/category/${id}/status`, method: 'patch', data: { status } })
  return mockToggleDictCategoryStatus(id, status)
}

/* ---------------- 数据字典 - 项 ---------------- */

/**
 * 查询某分类下的字典项列表
 * @param {Object} params
 * @param {number} params.categoryId 分类 id
 * @returns {Promise<Array<{
 *   id: number, categoryId: number, code: string, label: string,
 *   value: string, sort: number, status: number, remark: string
 * }>>}
 */
export function getDictItems(params) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/dict/item', method: 'get', params })
  return mockGetDictItems(params)
}

/**
 * 新增字典项
 * @param {Object} data
 * @param {number} data.categoryId 分类 id
 * @param {string} data.code      项编码
 * @param {string} data.label      显示名称
 * @param {string} data.value      存储值
 * @param {number} [data.sort]     排序
 * @param {string} [data.remark]   备注
 * @returns {Promise<Object>}
 */
export function addDictItem(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: '/system/dict/item', method: 'post', data })
  return mockAddDictItem(data)
}

/**
 * 修改字典项
 * @param {Object} data 必须包含 id
 * @returns {Promise<Object>}
 */
export function updateDictItem(data) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/dict/item/${data.id}`, method: 'put', data })
  return mockUpdateDictItem(data)
}

/**
 * 启用 / 停用字典项
 * @param {number} id     字典项 id
 * @param {number} status 1 启用 / 0 停用
 * @returns {Promise<boolean>}
 */
export function toggleDictItemStatus(id, status) {
  // 【后端接口就绪后，替换此处为真实axios请求】
  // return request({ url: `/system/dict/item/${id}/status`, method: 'patch', data: { status } })
  return mockToggleDictItemStatus(id, status)
}
