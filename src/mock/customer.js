/**
 * 客户模块 Mock 数据
 * 【后端接口就绪后，本文件可整体删除】
 */
import { clone, eq, like, paginate, reply } from './helper'

/** 客户状态枚举：正常 / 黑名单 */
export const CUSTOMER_STATUS = { NORMAL: '正常', BLACKLIST: '黑名单' }

/** 客户列表假数据（含设计稿中的 6 家客户） */
export const customerList = [
  {
    id: 1,
    name: '杭州云仓商贸',
    contact: '李经理',
    phone: '13812345678',
    address: '杭州市余杭区仓前路18号',
    orderCount: 42,
    remark: '长期合作客户，账期 30 天',
    status: '正常'
  },
  {
    id: 2,
    name: '苏州恒达物流',
    contact: '张主管',
    phone: '13909876543',
    address: '苏州市吴中区物流大道66号',
    orderCount: 36,
    remark: '物流承运商兼客户',
    status: '正常'
  },
  {
    id: 3,
    name: '宁波港城贸易',
    contact: '王总',
    phone: '13701234567',
    address: '宁波市北仑区港城路9号',
    orderCount: 28,
    remark: '出口业务为主',
    status: '正常'
  },
  {
    id: 4,
    name: '无锡鑫源五金',
    contact: '陈采购',
    phone: '13609871234',
    address: '无锡市新吴区兴源北路128号',
    orderCount: 21,
    remark: '五金配件采购',
    status: '正常'
  },
  {
    id: 5,
    name: '合肥新宇电子',
    contact: '刘工',
    phone: '13512349876',
    address: '合肥市高新区望江西路456号',
    orderCount: 17,
    remark: '存在逾期付款记录',
    status: '黑名单'
  },
  {
    id: 6,
    name: '上海联创家居',
    contact: '周经理',
    phone: '13487651230',
    address: '上海市青浦区汇金路100号',
    orderCount: 12,
    remark: '新签客户',
    status: '正常'
  }
]

/** 客户列表查询：客户名称 / 联系人 / 电话关键字 + 状态筛选 + 分页 */
export function mockGetCustomerList(params = {}) {
  const filtered = customerList.filter(item => {
    const hitKeyword = like(item.name, params.keyword) || like(item.contact, params.keyword) || like(item.phone, params.keyword)
    return hitKeyword && eq(item.status, params.status)
  })
  return reply(paginate(filtered, params))
}

/** 新增客户 */
export function mockAddCustomer(payload) {
  const row = { ...clone(payload), id: Date.now(), orderCount: 0, status: payload.status || '正常' }
  customerList.push(row)
  return reply(row)
}

/** 修改客户 */
export function mockUpdateCustomer(payload) {
  const index = customerList.findIndex(item => item.id === payload.id)
  if (index > -1) customerList.splice(index, 1, { ...customerList[index], ...clone(payload) })
  return reply(customerList[index])
}

/** 删除客户 */
export function mockDeleteCustomer(id) {
  const index = customerList.findIndex(item => item.id === id)
  if (index > -1) customerList.splice(index, 1)
  return reply(true)
}

/** 加入 / 移出黑名单 */
export function mockToggleBlacklist(id, status) {
  const row = customerList.find(item => item.id === id)
  if (row) row.status = status
  return reply(true)
}

/** 客户下拉选项（新建订单时选择客户） */
export function mockGetCustomerOptions() {
  return reply(clone(customerList.map(item => ({ id: item.id, name: item.name }))))
}