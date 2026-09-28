<template>
  <nav class="sidebar-menu">
    <template v-for="route in visibleRoutes">
      <!-- 有子菜单的目录 -->
      <div v-if="hasChildren(route)" :key="route.path" class="nav-group">
        <div class="nav-item nav-parent" @click="toggleGroup(route.path)">
          <span class="nav-icon" v-html="getIcon(route.meta.icon, 16)"></span>
          <span v-show="!collapsed" class="nav-label">{{ route.meta.title }}</span>
          <span
            v-show="!collapsed"
            class="nav-caret"
            :class="{ 'is-open': openGroups.includes(route.path) }"
            v-html="getIcon('chevron-down', 14)"
          ></span>
        </div>
        <div v-show="!collapsed && openGroups.includes(route.path)" class="nav-children">
          <router-link
            v-for="child in route.children.filter(c => !c.meta || !c.meta.hidden)"
            :key="child.path"
            :to="resolvePath(route.path, child.path)"
            class="nav-item nav-child"
            :class="{ 'is-active': isActive(resolvePath(route.path, child.path)) }"
          >
            <span class="nav-label">{{ child.meta.title }}</span>
          </router-link>
        </div>
      </div>
      <!-- 无子菜单的单页 -->
      <router-link
        v-else
        :key="route.path"
        :to="resolveSinglePath(route)"
        class="nav-item nav-single"
        :class="{ 'is-active': isActive(resolveSinglePath(route)) }"
      >
        <span class="nav-icon" v-html="getIcon(getSingleMeta(route).icon, 16)"></span>
        <span v-show="!collapsed" class="nav-label">{{ getSingleMeta(route).title }}</span>
      </router-link>
    </template>
  </nav>
</template>

<script>
/**
 * SidebarMenu 左侧权限菜单
 * 图标严格对齐设计稿（Lucide 图标库），导航项结构与 Sidebar 组件 N0mN9 一致：
 *   一级项 34px 高 / 图标16px + 文字13.5px；二级项纯文字13px muted
 */

/* Lucide 图标内容（viewBox 0 0 24 24，stroke 风格） */
const LUCIDE_PATHS = {
  dashboard:
    '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  user:
    '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  order:
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h.01M9 16h.01M13 12h2M13 16h2"/>',
  factory:
    '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1M12 18h1M7 18h1"/>',
  warehouse:
    '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12M6 14h12M6 10h12"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  chart:
    '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  monitor:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevrons-up-down': '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  boxes:
    '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7.16 10 12 13l5-3-3.03-1.82a2 2 0 0 0-2.06 0L7.16 10Z"/><path d="m12 13 4.87 2.92A2 2 0 0 1 18 17.63v3.24a2 2 0 0 1-.97 1.71l-3 1.8a2 2 0 0 1-2.06 0L12 19"/><path d="M16.74 16.5 12 13.5"/>'
}

export default {
  name: 'SidebarMenu',
  props: {
    routes: { type: Array, default: () => [] },
    collapsed: { type: Boolean, default: false }
  },
  data() {
    return {
      openGroups: []
    }
  },
  computed: {
    visibleRoutes() {
      return this.routes.filter(r => !r.meta || !r.meta.hidden)
    }
  },
  watch: {
    $route: {
      handler() {
        this.autoOpenGroup()
      },
      immediate: true
    }
  },
  methods: {
    hasChildren(route) {
      return route.children && route.children.length > 1
    },
    /**
     * 单页路由的展示 meta
     * 单子路由时 title/icon 定义在唯一子路由上（如 /user → children[0].meta），
     * 需合并父级 meta（redirect 等场景）后用于图标与文字渲染。
     */
    getSingleMeta(route) {
      if (route.children && route.children.length === 1) {
        return Object.assign({}, route.meta, route.children[0].meta)
      }
      return route.meta || {}
    },
    resolvePath(parent, child) {
      if (child.startsWith('/')) return child
      return (parent + '/' + child).replace(/\/+/g, '/')
    },
    resolveSinglePath(route) {
      if (route.redirect) return route.redirect
      if (route.children && route.children.length === 1) {
        return this.resolvePath(route.path, route.children[0].path)
      }
      return route.path
    },
    isActive(path) {
      return this.$route.path === path || this.$route.path.startsWith(path + '/')
    },
    toggleGroup(path) {
      const idx = this.openGroups.indexOf(path)
      if (idx > -1) this.openGroups.splice(idx, 1)
      else this.openGroups.push(path)
    },
    autoOpenGroup() {
      this.visibleRoutes.forEach(route => {
        if (this.hasChildren(route) && this.$route.path.startsWith(route.path)) {
          if (!this.openGroups.includes(route.path)) {
            this.openGroups.push(route.path)
          }
        }
      })
    },
    getIcon(name, size) {
      const inner = LUCIDE_PATHS[name] || LUCIDE_PATHS.dashboard
      return (
        '<svg width="' +
        size +
        '" height="' +
        size +
        '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        inner +
        '</svg>'
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-menu {
  width: 100%;

  &::-webkit-scrollbar {
    width: 4px;
  }
}

/* 导航容器由父级 AppLayout 提供滚动 */
.nav-group,
.nav-single {
  display: block;
}

.nav-item {
  display: flex;
  align-items: center;
  height: 34px;
  border-radius: $wms-radius;
  padding: 0 10px;
  gap: 10px;
  color: $wms-nav-text;
  font-size: $wms-fs-135;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: $wms-nav-hover;
    color: $wms-nav-active-text;
  }

  &.is-active {
    background: $wms-nav-active;
    color: $wms-nav-active-text;
  }
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: $wms-nav-muted;
}

.nav-single.is-active .nav-icon,
.nav-parent:hover .nav-icon {
  color: inherit;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.nav-caret {
  margin-left: auto;
  display: flex;
  align-items: center;
  color: $wms-nav-muted;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(180deg);
  }
}

.nav-children {
  display: flex;
  flex-direction: column;
  padding: 2px 0 4px;

  .nav-child {
    height: 32px;
    padding-left: 36px;
    font-size: $wms-fs-base;
    font-weight: 400;
    color: $wms-nav-muted;
    border-radius: $wms-radius;

    &:hover {
      color: $wms-nav-active-text;
    }

    &.is-active {
      background: transparent;
      color: $wms-nav-active-text;
      font-weight: 500;
    }
  }
}
</style>