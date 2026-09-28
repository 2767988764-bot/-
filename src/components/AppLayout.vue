<template>
  <div class="app-layout">
    <!-- 左侧导航 -->
    <aside class="app-sidebar" :class="{ 'is-collapsed': collapsed }">
      <!-- 品牌区 -->
      <div class="sidebar-brand">
        <span class="brand-logo">
          <span class="brand-logo-icon" v-html="boxesIcon(17)"></span>
        </span>
        <div v-show="!collapsed" class="brand-text">
          <span class="brand-name">仓储物流管理系统</span>
          <span class="brand-sub">WMS · 中小企业版</span>
        </div>
      </div>

      <!-- 导航菜单（Nav padding [6,10]，对齐设计稿） -->
      <div class="sidebar-nav">
        <sidebar-menu :routes="menus" :collapsed="collapsed" />
      </div>

      <!-- 分割线 -->
      <div class="sidebar-divider"></div>

      <!-- 底部用户信息 -->
      <div class="sidebar-footer">
        <span class="footer-avatar">{{ avatarText }}</span>
        <div v-show="!collapsed" class="footer-text">
          <span class="footer-user">{{ role || '系统管理员' }}</span>
          <span class="footer-mail">{{ username }}@wms.cn</span>
        </div>
        <span v-show="!collapsed" class="footer-caret" v-html="caretIcon(14)"></span>
      </div>
    </aside>

    <!-- 右侧主区域 -->
    <div class="app-main">
      <top-header
        :collapsed="collapsed"
        :unread="notificationUnread"
        @toggle="toggleSidebar"
        @open-profile="showProfile = true"
        @open-settings="openSettings"
        @open-notification="toggleNotification"
      />
      <div class="app-content">
        <breadcrumb />
        <div class="app-page">
          <router-view />
        </div>
      </div>
    </div>

    <!-- 浮层组件：个人中心 / 系统设置 / 通知小方格 -->
    <user-profile-overlay
      :visible.sync="showProfile"
      @close="showProfile = false"
    />
    <system-setting-overlay
      :visible.sync="showSettings"
      @close="showSettings = false"
    />
    <notification-pop-square
      v-show="showNotification"
      :visible="showNotification"
      @close="showNotification = false"
      @update:unread="onUnreadChange"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarMenu from './SidebarMenu.vue'
import TopHeader from './TopHeader.vue'
import Breadcrumb from './Breadcrumb.vue'
import UserProfileOverlay from './layout/UserProfileOverlay.vue'
import SystemSettingOverlay from './layout/SystemSettingOverlay.vue'
import NotificationPopSquare from './layout/NotificationPopSquare.vue'
import { getUnreadCount } from '@/api/notification'

export default {
  name: 'AppLayout',
  components: {
    SidebarMenu,
    TopHeader,
    Breadcrumb,
    UserProfileOverlay,
    SystemSettingOverlay,
    NotificationPopSquare
  },
  data() {
    return {
      showProfile: false,
      showSettings: false,
      showNotification: false,
      notificationUnread: 0
    }
  },
  computed: {
    ...mapGetters(['menus', 'sidebarCollapsed', 'role', 'name']),
    collapsed() {
      return this.sidebarCollapsed
    },
    username() {
      return this.$store.state.user.username || 'admin'
    },
    avatarText() {
      // 设计稿显示中文角色首字「管」，回退到用户姓名首字
      return (this.role && this.role.charAt(0)) || (this.name && this.name.charAt(0)) || '管'
    },
    isAdmin() {
      // 业务逻辑待与后端对接：依据后端返回的 roles/permissions 判断
      // 当前 mock 默认系统管理员 = '系统管理员'
      return this.role === '系统管理员'
    }
  },
  mounted() {
    this.loadUnreadCount()
  },
  methods: {
    toggleSidebar() {
      this.$store.dispatch('app/toggleSidebar')
    },
    openSettings() {
      // 二次权限校验：非系统管理员禁止唤起系统设置浮层
      if (!this.isAdmin) {
        this.$message.warning('仅系统管理员可访问系统设置')
        return
      }
      this.showSettings = true
    },
    toggleNotification() {
      this.showNotification = !this.showNotification
    },
    onUnreadChange(count) {
      this.notificationUnread = Number(count) || 0
    },
    async loadUnreadCount() {
      try {
        const res = await getUnreadCount()
        this.notificationUnread = res.unread
      } catch (e) {
        // 业务逻辑待与后端对接：忽略错误，不阻塞布局渲染
      }
    },
    boxesIcon(size) {
      const d =
        '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7.16 10 12 13l5-3-3.03-1.82a2 2 0 0 0-2.06 0L7.16 10Z"/><path d="m12 13 4.87 2.92A2 2 0 0 1 18 17.63v3.24a2 2 0 0 1-.97 1.71l-3 1.8a2 2 0 0 1-2.06 0L12 19"/><path d="M16.74 16.5 12 13.5"/>'
      return (
        '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'
      )
    },
    caretIcon(size) {
      const d = '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>'
      return (
        '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.app-sidebar {
  width: $wms-sidebar-width;
  flex-shrink: 0;
  background: $wms-nav-bg;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;

  &.is-collapsed {
    width: 56px;
  }
}

/* ---------- 品牌区 ---------- */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 12px;

  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: $wms-radius-sm;
    background: $wms-brand;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .brand-logo-icon {
      display: flex;
      color: #ffffff;
    }
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    .brand-name {
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
    }

    .brand-sub {
      font-size: 10px;
      color: $wms-nav-muted;
      white-space: nowrap;
    }
  }
}

/* ---------- 导航 ---------- */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 6px 10px;

  &::-webkit-scrollbar {
    width: 4px;
  }
}

.sidebar-divider {
  height: 1px;
  background: $wms-nav-border;
  margin: 0 14px;
  flex-shrink: 0;
}

/* ---------- 底部用户信息 ---------- */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  flex-shrink: 0;

  .footer-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $wms-nav-active;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $wms-fs-base;
    font-weight: 500;
    flex-shrink: 0;
  }

  .footer-text {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
    flex: 1;
    min-width: 0;

    .footer-user {
      font-size: $wms-fs-base;
      font-weight: 500;
      color: $wms-nav-text;
      white-space: nowrap;
    }

    .footer-mail {
      font-size: 11px;
      color: $wms-nav-muted;
      white-space: nowrap;
    }
  }

  .footer-caret {
    display: flex;
    color: $wms-nav-muted;
  }
}

/* ---------- 主区域 ---------- */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-page {
  padding: 0 $wms-page-padding $wms-page-padding;
  max-width: $wms-content-width;
  margin: 0 auto;
}
</style>