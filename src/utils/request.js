/**
 * Axios 统一封装
 * ---------------------------------------------------------------
 * 当前阶段：前端全部使用 src/mock 下的本地数据，本文件暂未被真实调用，
 *          仅作为后续对接后端时的统一请求入口（已按后端规范预留）。
 * 对接步骤：
 *   1. vue.config.js 中放开 devServer.proxy 配置；
 *   2. src/api/*.js 中把 Promise.resolve(mockXxx()) 换成 request({...})；
 *   3. 如后端响应结构不同，仅需调整下方响应拦截器的解构逻辑。
 */
import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import router from '@/router'

/** 请求基础路径：开发环境走代理，生产环境由 Nginx 反向代理 */
export const baseURL = process.env.VUE_APP_BASE_API || '/api'

/** 后端约定的统一响应结构：{ code, message, data } */
const SUCCESS_CODE = 200

const service = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

/* ---------------- 请求拦截：注入 Token ---------------- */
service.interceptors.request.use(
  config => {
    const token = store.state.user.token || localStorage.getItem('wms_token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => Promise.reject(error)
)

/* ---------------- 响应拦截：统一错误处理 ---------------- */
service.interceptors.response.use(
  response => {
    const res = response.data
    // 文件流 / 非标准响应直接返回
    if (res instanceof Blob) return res
    if (res.code === undefined) return res

    if (res.code !== SUCCESS_CODE) {
      if (res.code === 401) {
        MessageBox.confirm('登录状态已失效，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken')
          router.push('/login')
        })
      } else {
        Message({ message: res.message || '请求失败', type: 'error', duration: 3000 })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }
    // 仅返回业务数据体
    return res.data
  },
  error => {
    const status = error.response && error.response.status
    const tips = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '没有访问权限',
      404: '请求地址不存在',
      500: '服务器内部错误',
      502: '网关错误',
      504: '网关超时'
    }
    Message({ message: tips[status] || error.message || '网络异常', type: 'error', duration: 3000 })
    return Promise.reject(error)
  }
)

export default service