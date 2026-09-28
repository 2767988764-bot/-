import Vue from 'vue'
import VueRouter from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

Vue.use(VueRouter)

/**
 * 重写 push / replace，静默处理导航守卫引起的重定向 / 取消
 * 背景：vue-router 3.1 起，守卫中 next 重定向会让 push/replace 返回的 Promise reject，
 *      未被 catch 时会触发开发环境「Uncaught runtime errors」遮罩。
 * 此为 vue-router 官方文档推荐的处理方式。
 */
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

function handleNavigationError(err) {
  // 重定向 / 导航取消 / 导航中止属于正常导航流程，不向上抛出
  if (VueRouter.isNavigationFailure(err)) return err
  return Promise.reject(err)
}

VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject)
  }
  return originalPush.call(this, location).catch(handleNavigationError)
}

VueRouter.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalReplace.call(this, location, onResolve, onReject)
  }
  return originalReplace.call(this, location).catch(handleNavigationError)
}

/**
 * 路由配置
 * ---------------------------------------------------------------
 * meta 字段说明：
 *   title   菜单 / 面包屑标题
 *   icon    侧边栏图标标识（对应 SidebarMenu 内置 SVG 图标名）
 *   roles   可访问角色，缺省表示全部角色可见
 *   hidden  为 true 时不渲染在侧边栏
 *   activeMenu 详情页高亮的侧边栏菜单路径
 */

/* ---------------- 无需权限的基础路由 ---------------- */
export const constantRoutes = [
  {
    path: '/',
    redirect: '/dashboard',
    meta: { hidden: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在', hidden: true }
  }
]

/* ---------------- 业务路由（按角色动态挂载） ---------------- */
export const asyncRoutes = [
  {
    path: '/dashboard',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页仪表盘', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/user',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'UserList',
        component: () => import('@/views/user/UserList.vue'),
        meta: { title: '用户管理', icon: 'user', roles: ['系统管理员', '总经理'] }
      }
    ]
  },
  {
    path: '/permission',
    component: AppLayout,
    redirect: '/permission/role',
    meta: { title: '角色权限', icon: 'shield', roles: ['系统管理员', '总经理'] },
    children: [
      {
        path: 'role',
        name: 'RoleList',
        component: () => import('@/views/permission/RoleList.vue'),
        meta: { title: '角色列表', roles: ['系统管理员', '总经理'] }
      },
      {
        path: 'list',
        name: 'PermissionList',
        component: () => import('@/views/permission/PermissionList.vue'),
        meta: { title: '权限列表', roles: ['系统管理员', '总经理'] }
      }
    ]
  },
  {
    path: '/order',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'OrderList',
        component: () => import('@/views/order/OrderList.vue'),
        meta: { title: '订单管理', icon: 'order' }
      }
    ]
  },
  {
    path: '/production',
    component: AppLayout,
    redirect: '/production/line',
    meta: { title: '生产管理', icon: 'factory' },
    children: [
      {
        path: 'line',
        name: 'MyProduction',
        component: () => import('@/views/production/MyProduction.vue'),
        meta: { title: '我的生产' }
      },
      {
        path: 'record',
        name: 'ProductionRecord',
        component: () => import('@/views/production/ProductionRecord.vue'),
        meta: { title: '生产档案' }
      }
    ]
  },
  {
    path: '/warehouse',
    component: AppLayout,
    redirect: '/warehouse/mine',
    meta: { title: '仓库管理', icon: 'warehouse' },
    children: [
      {
        path: 'mine',
        name: 'MyWarehouse',
        component: () => import('@/views/warehouse/MyWarehouse.vue'),
        meta: { title: '我的仓库' }
      },
      {
        path: 'in',
        name: 'StockIn',
        component: () => import('@/views/warehouse/StockIn.vue'),
        meta: { title: '入库管理' }
      },
      {
        path: 'out',
        name: 'StockOut',
        component: () => import('@/views/warehouse/StockOut.vue'),
        meta: { title: '出库管理' }
      },
      {
        path: 'check',
        name: 'InventoryCheck',
        component: () => import('@/views/warehouse/InventoryCheck.vue'),
        meta: { title: '仓库盘点' }
      }
    ]
  },
  {
    path: '/shipping',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'ShippingList',
        component: () => import('@/views/shipping/ShippingList.vue'),
        meta: { title: '发货管理', icon: 'truck' }
      }
    ]
  },
  {
    path: '/base',
    component: AppLayout,
    redirect: '/base/customer',
    meta: { title: '基础数据', icon: 'database' },
    children: [
      {
        path: 'customer',
        name: 'CustomerList',
        component: () => import('@/views/base/CustomerList.vue'),
        meta: { title: '客户列表' }
      },
      {
        path: 'warehouse',
        name: 'WarehouseData',
        component: () => import('@/views/base/WarehouseData.vue'),
        meta: { title: '仓库资料' }
      }
    ]
  },
  {
    path: '/statistics',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'StatisticsReport',
        component: () => import('@/views/statistics/StatisticsReport.vue'),
        meta: { title: '报表统计', icon: 'chart' }
      }
    ]
  },
  {
    path: '/monitor',
    component: AppLayout,
    redirect: '/monitor/online',
    meta: { title: '系统监控', icon: 'monitor', roles: ['系统管理员'] },
    children: [
      {
        path: 'online',
        name: 'OnlineUser',
        component: () => import('@/views/monitor/OnlineUser.vue'),
        meta: { title: '在线用户', roles: ['系统管理员'] }
      },
      {
        path: 'log',
        name: 'OperationLog',
        component: () => import('@/views/monitor/OperationLog.vue'),
        meta: { title: '操作日志', roles: ['系统管理员'] }
      }
    ]
  }
]

const createRouter = () =>
  new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

/* 重置路由（登出后清空动态挂载的业务路由） */
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router