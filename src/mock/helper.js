/**
 * Mock 通用工具
 * ---------------------------------------------------------------
 * 仅服务于 src/mock 下的本地假数据，后端接口就绪后整个 mock 目录可直接删除。
 */

/** 模拟网络延迟后返回数据 */
export function reply(data, ms = 200) {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), ms)
  })
}

/** 深拷贝，避免页面直接修改 mock 源数据 */
export function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

/** 列表分页：返回 { list, total, page, pageSize } */
export function paginate(list, params = {}) {
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const start = (page - 1) * pageSize
  return {
    list: clone(list.slice(start, start + pageSize)),
    total: list.length,
    page,
    pageSize
  }
}

/** 模糊匹配：字段值包含关键字即命中 */
export function like(value, keyword) {
  if (!keyword) return true
  return String(value == null ? '' : value)
    .toLowerCase()
    .includes(String(keyword).toLowerCase())
}

/** 精确匹配：筛选值为空时视为不过滤 */
export function eq(value, condition) {
  if (condition === '' || condition === null || condition === undefined) return true
  return String(value) === String(condition)
}

/** 生成业务编号，如 N20260928001 / G20260928001 */
export function genNo(prefix, index, date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${prefix}${y}${m}${d}${String(index).padStart(3, '0')}`
}

/** 分页响应中的提示文案，如「共 156 条记录，当前显示 1-6 条」 */
export function footerText(total, page, pageSize) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return `共 ${total} 条记录，当前显示 ${from}-${to} 条`
}