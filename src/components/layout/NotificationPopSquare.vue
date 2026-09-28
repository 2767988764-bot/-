<template>
  <!-- 通知小方格下拉浮层：紧贴铃铛下方，紧凑型，禁止做成大模态弹窗 -->
  <transition name="pop-square">
    <div v-show="visible" class="notif-pop" @click.stop>
      <!-- 顶部：标题 + 全部已读 -->
      <header class="pop-header">
        <div class="header-left">
          <span class="header-title">通知</span>
          <span v-if="unread > 0" class="unread-badge">{{ unread }}</span>
        </div>
        <div class="header-actions">
          <button
            class="action-btn"
            :disabled="unread === 0 || markingAll"
            @click="handleMarkAllRead"
          >
            {{ markingAll ? '处理中…' : '全部标为已读' }}
          </button>
        </div>
      </header>

      <!-- 类型筛选条 -->
      <div class="filter-bar">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          class="filter-chip"
          :class="{ 'chip-active': activeFilter === opt.value }"
          @click="onChangeFilter(opt.value)"
        >
          {{ opt.label }}
          <em v-if="opt.count !== null" class="chip-count">{{ opt.count }}</em>
        </button>
      </div>

      <!-- 通知列表：内部滚动 -->
      <div class="pop-body">
        <div v-if="loading" class="empty-state">
          <i class="el-icon-loading"></i>
          <span>加载中…</span>
        </div>
        <div v-else-if="!list.length" class="empty-state">
          <i class="el-icon-bell"></i>
          <span>暂无通知</span>
        </div>
        <ul v-else class="notif-list">
          <li
            v-for="item in list"
            :key="item.id"
            class="notif-item"
            :class="{ 'item-unread': !item.read }"
            @click="onItemClick(item)"
          >
            <span class="item-dot" :class="typeColorClass(item.type)"></span>
            <div class="item-main">
              <div class="item-title-row">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-time">{{ formatTime(item.time) }}</span>
              </div>
              <p class="item-content">{{ item.content }}</p>
              <div class="item-meta">
                <span class="type-tag" :class="typeColorClass(item.type)">
                  {{ typeLabel(item.type) }}
                </span>
                <span class="read-tag" :class="item.read ? 'tag-read' : 'tag-unread'">
                  {{ item.read ? '已读' : '未读' }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 底部：查看全部 -->
      <footer class="pop-footer" @click="handleViewAll">
        <span>查看全部通知</span>
        <i class="el-icon-arrow-right"></i>
      </footer>
    </div>
  </transition>
</template>

<script>
import { getNotifications, markAsRead, markAllAsRead } from '@/api/notification'
import { notificationTypeMap } from '@/mock/notification'

export default {
  name: 'NotificationPopSquare',
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      list: [],
      unread: 0,
      total: 0,
      loading: false,
      markingAll: false,
      activeFilter: 0, // 0 全部 / 1 系统 / 2 订单 / 3 入出库 / 4 权限 / 5 任务
      filterOptions: [
        { label: '全部', value: 0, count: null },
        { label: '系统', value: 1, count: 0 },
        { label: '订单', value: 2, count: 0 },
        { label: '入出库', value: 3, count: 0 },
        { label: '权限', value: 4, count: 0 },
        { label: '任务', value: 5, count: 0 }
      ]
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.activeFilter = 0
        this.loadList()
      }
    }
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const params = { limit: 15 }
        if (this.activeFilter !== 0) params.type = this.activeFilter
        const res = await getNotifications(params)
        this.list = res.list
        this.unread = res.unread
        this.total = res.total
        // 同步计数：先取一次全部分类统计
        if (this.activeFilter === 0) {
          this.updateChipCounts(res.list, res.total)
        }
      } catch (e) {
        this.$message.error('加载通知失败')
      } finally {
        this.loading = false
      }
    },
    async updateChipCounts(currentList, currentTotal) {
      // 简化版：基于当前 list 估算各分类计数（mock 内已按时间倒序返回前 15 条）
      const counts = { 0: currentTotal, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      currentList.forEach(n => {
        counts[n.type] = (counts[n.type] || 0) + 1
      })
      this.filterOptions = this.filterOptions.map(opt => ({
        ...opt,
        count: opt.value === 0 ? currentTotal : counts[opt.value] || 0
      }))
    },
    onChangeFilter(val) {
      if (this.activeFilter === val) return
      this.activeFilter = val
      this.loadList()
    },
    async onItemClick(item) {
      if (!item.read) {
        try {
          await markAsRead(item.id)
          item.read = true
          this.unread = Math.max(0, this.unread - 1)
          this.$emit('update:unread', this.unread)
          this.$emit('read', item)
        } catch (e) {
          // 业务逻辑待与后端对接：忽略错误，前端不阻塞 UI
        }
      }
      // 业务逻辑待与后端对接：根据通知类型跳转相应详情页
      // this.$emit('navigate', item)
    },
    async handleMarkAllRead() {
      if (this.unread === 0) return
      this.markingAll = true
      try {
        const res = await markAllAsRead()
        this.list.forEach(n => { n.read = true })
        this.unread = 0
        this.$emit('update:unread', 0)
        this.$message.success(`已标记 ${res.updated} 条通知为已读`)
      } catch (e) {
        this.$message.error('操作失败')
      } finally {
        this.markingAll = false
      }
    },
    handleViewAll() {
      // 业务逻辑待与后端对接：跳转到通知中心页面（暂未实现，先关闭浮层）
      this.$message.info('通知中心页面待与后端对接')
      this.$emit('close')
    },
    typeLabel(type) {
      return (notificationTypeMap[type] || { label: '其他' }).label
    },
    typeColorClass(type) {
      const color = (notificationTypeMap[type] || { color: 'neutral' }).color
      return `type-${color}`
    },
    formatTime(time) {
      if (!time) return ''
      // 简化：今日消息只显示 HH:mm，其它显示完整日期
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      if (time.startsWith(todayStr)) {
        return time.slice(11)
      }
      return time
    }
  }
}
</script>

<style lang="scss" scoped>
.notif-pop {
  position: absolute;
  top: calc(#{$wms-header-height} - 8px);
  right: 24px;
  width: 360px;
  background: $wms-panel;
  border: 1px solid $wms-border;
  border-radius: $wms-radius-md;
  box-shadow: $wms-shadow-lg;
  z-index: 2001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ---------- Header ---------- */
.pop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px;
  border-bottom: 1px solid $wms-border;

  .header-left {
    display: flex;
    align-items: center;
    gap: 6px;

    .header-title {
      font-family: $wms-font-heading;
      font-size: $wms-fs-md;
      font-weight: 600;
      color: $wms-text;
    }

    .unread-badge {
      min-width: 18px;
      height: 18px;
      padding: 0 6px;
      background: $wms-danger;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      line-height: 18px;
      text-align: center;
      border-radius: 9px;
    }
  }

  .action-btn {
    border: none;
    background: transparent;
    color: $wms-brand;
    font-size: $wms-fs-11;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: $wms-radius-sm;
    transition: background 0.15s ease;

    &:hover:not(:disabled) {
      background: $wms-brand-soft;
    }

    &:disabled {
      color: $wms-text-3;
      cursor: not-allowed;
    }
  }
}

/* ---------- 筛选条 ---------- */
.filter-bar {
  display: flex;
  gap: 4px;
  padding: 8px 14px;
  border-bottom: 1px solid $wms-border;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 0;
  }

  .filter-chip {
    border: 1px solid $wms-border;
    background: $wms-panel;
    color: $wms-text-2;
    font-size: $wms-fs-11;
    padding: 2px 8px;
    border-radius: 10px;
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s ease;

    &:hover {
      border-color: $wms-brand-hover;
      color: $wms-brand;
    }

    &.chip-active {
      background: $wms-brand;
      border-color: $wms-brand;
      color: $wms-brand-ink;

      .chip-count {
        color: $wms-brand-ink;
        opacity: 0.85;
      }
    }

    .chip-count {
      font-style: normal;
      color: $wms-text-3;
      font-size: 10px;
      line-height: 1;
    }
  }
}

/* ---------- 列表 ---------- */
.pop-body {
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: $wms-border-strong;
    border-radius: 2px;
  }
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
}

.notif-item {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid $wms-border;
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: $wms-panel-3;
  }

  &.item-unread {
    background: $wms-brand-soft;

    &:hover {
      background: $wms-brand-soft;
    }

    .item-title {
      font-weight: 600;
    }
  }

  .item-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-top: 6px;
    flex-shrink: 0;

    &.type-info { background: $wms-info; }
    &.type-brand { background: $wms-brand; }
    &.type-ok { background: $wms-ok; }
    &.type-warn { background: $wms-warn; }
    &.type-danger { background: $wms-danger; }
    &.type-neutral { background: $wms-neutral; }
  }

  .item-main {
    flex: 1;
    min-width: 0;
  }

  .item-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 2px;

    .item-title {
      font-size: $wms-fs-125;
      color: $wms-text;
      font-weight: 500;
      @include wms-ellipsis;
    }

    .item-time {
      font-size: 10px;
      color: $wms-text-3;
      flex-shrink: 0;
    }
  }

  .item-content {
    margin: 0 0 6px;
    font-size: $wms-fs-11;
    color: $wms-text-2;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: 6px;

    .type-tag,
    .read-tag {
      display: inline-block;
      padding: 0 6px;
      border-radius: 9px;
      font-size: 10px;
      line-height: 16px;
      height: 16px;
    }

    .type-tag {
      &.type-info { background: $wms-info-soft; color: $wms-info; }
      &.type-brand { background: $wms-brand-soft; color: $wms-brand; }
      &.type-ok { background: $wms-ok-soft; color: $wms-ok; }
      &.type-warn { background: $wms-warn-soft; color: $wms-warn; }
      &.type-danger { background: $wms-danger-soft; color: $wms-danger; }
      &.type-neutral { background: $wms-neutral-soft; color: $wms-neutral; }
    }

    .read-tag {
      &.tag-read {
        background: $wms-neutral-soft;
        color: $wms-text-3;
      }

      &.tag-unread {
        background: $wms-danger-soft;
        color: $wms-danger;
        font-weight: 600;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  gap: 8px;
  color: $wms-text-3;
  font-size: $wms-fs-sm;

  i {
    font-size: 28px;
    opacity: 0.4;
  }
}

/* ---------- Footer ---------- */
.pop-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  border-top: 1px solid $wms-border;
  background: $wms-panel-3;
  color: $wms-brand;
  font-size: $wms-fs-125;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: $wms-brand-soft;
  }

  i {
    font-size: 12px;
  }
}

/* ---------- 过渡动画 ---------- */
.pop-square-enter-active,
.pop-square-leave-active {
  transition: all 0.16s ease;
  transform-origin: top right;
}

.pop-square-enter,
.pop-square-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
