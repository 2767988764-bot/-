import Vue from 'vue'
import Vuex from 'vuex'
import { asyncRoutes, constantRoutes, resetRouter } from '@/router'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/user'

Vue.use(Vuex)

/** 判断当前角色是否可访问某条路由 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  }
  return true
}

/** 递归过滤出当前角色可访问的路由表 */
export function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}

/* ============================ app ============================ */
const app = {
  namespaced: true,
  state: {
    sidebarCollapsed: false
  },
  mutations: {
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    SET_SIDEBAR(state, collapsed) {
      state.sidebarCollapsed = collapsed
    }
  },
  actions: {
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    }
  }
}

/* ============================ user ============================ */
const user = {
  namespaced: true,
  state: {
    token: localStorage.getItem('wms_token') || '',
    name: '',
    username: '',
    avatar: '',
    role: '',
    permissions: []
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('wms_token', token)
    },
    SET_USER(state, payload) {
      state.name = payload.name
      state.username = payload.username
      state.avatar = payload.avatar
      state.role = payload.role
      state.permissions = payload.permissions || []
    },
    CLEAR_USER(state) {
      state.token = ''
      state.name = ''
      state.username = ''
      state.avatar = ''
      state.role = ''
      state.permissions = []
      localStorage.removeItem('wms_token')
    }
  },
  actions: {
    /** 登录：接口就绪后由 api/user.js 内部切换为真实请求 */
    async login({ commit }, loginForm) {
      const data = await loginApi(loginForm)
      commit('SET_TOKEN', data.token)
      return data
    },
    /** 拉取当前登录人信息 */
    async getInfo({ commit }) {
      const data = await getUserInfo()
      commit('SET_USER', data)
      return data
    },
    async logout({ commit }) {
      try {
        await logoutApi()
      } finally {
        commit('CLEAR_USER')
        commit('permission/RESET_ROUTES', null, { root: true })
        // 重置路由 matcher，清除动态挂载的业务路由，避免再次登录时重复注册命名路由
        resetRouter()
      }
    },
    resetToken({ commit }) {
      commit('CLEAR_USER')
      commit('permission/RESET_ROUTES', null, { root: true })
      resetRouter()
    }
  }
}

/* ========================= permission ========================= */
const permission = {
  namespaced: true,
  state: {
    routes: [], // 完整路由（含常量路由），用于渲染侧边栏
    addRoutes: [] // 动态挂载的业务路由
  },
  mutations: {
    SET_ROUTES(state, routes) {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    RESET_ROUTES(state) {
      state.routes = []
      state.addRoutes = []
    }
  },
  actions: {
    /** 根据角色生成动态路由并挂载 */
    generateRoutes({ commit }, roles) {
      return new Promise(resolve => {
        const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    }
  }
}

export default new Vuex.Store({
  modules: { app, user, permission },
  getters: {
    /** 侧边栏菜单数据源 */
    menus: state => state.permission.routes,
    sidebarCollapsed: state => state.app.sidebarCollapsed,
    role: state => state.user.role,
    name: state => state.user.name
  }
})