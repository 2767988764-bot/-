<template>
  <header class="top-header">
    <div class="header-left">
      <button class="collapse-btn" @click="$emit('toggle')">
        <i :class="collapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
      </button>
      <span class="header-title">仓储物流管理系统</span>
    </div>
    <div class="header-right">
      <!-- 铃铛：点击触发通知浮层 -->
      <el-tooltip content="消息通知" placement="bottom">
        <button class="header-icon-btn" @click="$emit('open-notification')">
          <i class="el-icon-bell"></i>
          <span v-if="unread > 0" class="badge">{{ unread }}</span>
        </button>
      </el-tooltip>
      <el-divider direction="vertical" />
      <el-dropdown trigger="click" @command="onCommand">
        <div class="user-info">
          <span class="user-avatar">{{ avatarText }}</span>
          <div class="user-text">
            <span class="user-name">{{ name }}</span>
            <span class="user-role">{{ role }}</span>
          </div>
          <i class="el-icon-arrow-down"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="profile" icon="el-icon-user">个人中心</el-dropdown-item>
          <el-dropdown-item
            command="settings"
            icon="el-icon-setting"
            :disabled="!isAdmin"
            :title="isAdmin ? '' : '仅系统管理员可用'"
          >
            系统设置
            <span v-if="!isAdmin" class="menu-disabled-hint">（无权限）</span>
          </el-dropdown-item>
          <el-dropdown-item divided command="logout" icon="el-icon-switch-button">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TopHeader',
  props: {
    collapsed: Boolean,
    unread: { type: Number, default: 0 }
  },
  computed: {
    ...mapGetters(['name', 'role']),
    avatarText() {
      return this.name ? this.name.charAt(0) : 'U'
    },
    isAdmin() {
      // 业务逻辑待与后端对接：依据后端返回的 roles/permissions 判断
      // 当前 mock 默认系统管理员 = '系统管理员'
      return this.role === '系统管理员'
    }
  },
  methods: {
    onCommand(cmd) {
      if (cmd === 'profile') {
        this.$emit('open-profile')
      } else if (cmd === 'settings') {
        if (!this.isAdmin) {
          this.$message.warning('仅系统管理员可访问系统设置')
          return
        }
        this.$emit('open-settings')
      } else if (cmd === 'logout') {
        this.$confirm('确定退出登录吗？', '提示', { type: 'warning' })
          .then(() => this.$store.dispatch('user/logout'))
          .then(() => {
            this.$router.push('/login')
          })
          .catch(() => {})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.top-header {
  height: $wms-header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: $wms-panel;
  border-bottom: 1px solid $wms-border;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;

  .collapse-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: $wms-radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $wms-text-2;
    font-size: 18px;
    transition: all 0.15s ease;

    &:hover {
      background: $wms-panel-3;
      color: $wms-brand;
    }
  }

  .header-title {
    font-family: $wms-font-heading;
    font-size: $wms-fs-lg;
    font-weight: 600;
    color: $wms-text;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;

  .header-icon-btn {
    position: relative;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: $wms-radius;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $wms-text-2;
    font-size: 18px;
    transition: all 0.15s ease;

    &:hover {
      background: $wms-panel-3;
      color: $wms-brand;
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: $wms-danger;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      line-height: 16px;
      text-align: center;
      border-radius: 8px;
    }
  }

  .el-divider {
    height: 24px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: $wms-radius;
    transition: background 0.15s ease;

    &:hover {
      background: $wms-panel-3;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: $wms-brand;
      color: $wms-brand-ink;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $wms-fs-md;
      font-weight: 600;
      font-family: $wms-font-heading;
    }

    .user-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;

      .user-name {
        font-size: $wms-fs-125;
        font-weight: 500;
        color: $wms-text;
      }

      .user-role {
        font-size: $wms-fs-11;
        color: $wms-text-3;
      }
    }
  }
}
</style>

<style lang="scss">
/* 下拉菜单：el-dropdown 默认 teleport，需要全局样式覆盖 */
.el-dropdown-menu {
  .el-dropdown-menu__item {
    font-size: $wms-fs-base;
    padding: 0 16px;
    line-height: 32px;

    &.is-disabled {
      color: $wms-text-3;
      cursor: not-allowed;
      opacity: 0.6;

      .menu-disabled-hint {
        font-size: $wms-fs-11;
        margin-left: 4px;
      }
    }

    i {
      margin-right: 4px;
    }
  }
}
</style>
