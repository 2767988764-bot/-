import Vue from 'vue'
import ElementUI from 'element-ui'

// 样式加载顺序：Element-UI 主题（含设计色覆写） → 全局样式（含细节覆写与工具类）
import './styles/element-variables.scss'
import './styles/index.scss'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(ElementUI, { size: 'small', zIndex: 3000 })
Vue.config.productionTip = false

/**
 * 全局路由守卫
 * 职责：登录校验 + 按角色动态挂载业务路由（左侧权限菜单的数据来源）
 * 说明：守卫放在 main.js 中，避免 router 与 store 互相 import 造成循环依赖。
 */
const WHITE_LIST = ['/login', '/404']

router.beforeEach(async (to, from, next) => {
  const hasToken = !!store.state.user.token

  if (!hasToken) {
    if (WHITE_LIST.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
    return
  }

  if (to.path === '/login') {
    next({ path: '/' })
    return
  }

  // 已登录但尚未拉取用户信息 → 先取信息再动态挂载路由
  if (!store.state.user.role) {
    try {
      const info = await store.dispatch('user/getInfo')
      const accessRoutes = await store.dispatch('permission/generateRoutes', [info.role])
      accessRoutes.forEach(route => router.addRoute(route))
      // 兜底路由必须在动态路由之后注册，否则会拦截所有业务路径
      router.addRoute({ path: '*', redirect: '/404', meta: { hidden: true } })
      next({ ...to, replace: true })
    } catch (e) {
      store.dispatch('user/resetToken')
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
    return
  }

  next()
})

router.afterEach(to => {
  document.title = to.meta && to.meta.title ? `${to.meta.title} - 仓储物流管理系统` : '仓储物流管理系统'
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')