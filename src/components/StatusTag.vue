<template>
  <span class="status-tag" :class="cls">
    <span v-if="showDot" class="status-dot"></span>
    {{ label }}
  </span>
</template>

<script>
/**
 * StatusTag 状态标签组件
 * 用于展示支付状态、发货状态、启用/停用、入库状态等业务标签
 * 根据设计稿：圆角6px，字号12.5px，带圆点
 */
const TYPE_MAP = {
  success: { cls: 'tag-success', dot: '#2F7A55' },
  warning: { cls: 'tag-warning', dot: '#93661B' },
  danger: { cls: 'tag-danger', dot: '#AF4038' },
  info: { cls: 'tag-info', dot: '#39618C' },
  neutral: { cls: 'tag-neutral', dot: '#5B6068' },
  brand: { cls: 'tag-brand', dot: '#35604F' }
}

const STATUS_MAP = {
  // 支付状态
  已付款: 'success',
  未付款: 'danger',
  // 发货状态
  已发货: 'success',
  未发货: 'warning',
  // 启用/停用
  启用: 'success',
  停用: 'neutral',
  正常: 'success',
  黑名单: 'danger',
  // 入库/出库
  已入库: 'success',
  未入库: 'warning',
  已出库: 'brand',
  待出库: 'warning',
  // 生产线状态
  运行中: 'success',
  待开始: 'neutral',
  已完成: 'info',
  // 发货单状态
  待发货: 'warning',
  运输中: 'info',
  已签收: 'success',
  // 在线状态
  在线: 'success',
  离线: 'neutral',
  // 操作结果
  成功: 'success',
  失败: 'danger'
}

export default {
  name: 'StatusTag',
  props: {
    /** 状态文本，如「已付款」「已发货」「启用」等 */
    status: { type: String, default: '' },
    /** 手动指定类型，覆盖自动推断 */
    type: { type: String, default: '' },
    /** 是否显示圆点 */
    showDot: { type: Boolean, default: true }
  },
  computed: {
    resolvedType() {
      return this.type || STATUS_MAP[this.status] || 'neutral'
    },
    cls() {
      return TYPE_MAP[this.resolvedType] ? TYPE_MAP[this.resolvedType].cls : TYPE_MAP.neutral.cls
    },
    label() {
      return this.status
    }
  }
}
</script>

<style lang="scss" scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  height: 22px;
  line-height: 18px;
  font-size: $wms-fs-125;
  font-weight: 500;
  border-radius: $wms-radius;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-success { background: $wms-ok-soft; color: $wms-ok; .status-dot { background: $wms-ok; } }
.tag-warning { background: $wms-warn-soft; color: $wms-warn; .status-dot { background: $wms-warn; } }
.tag-danger  { background: $wms-danger-soft; color: $wms-danger; .status-dot { background: $wms-danger; } }
.tag-info    { background: $wms-info-soft; color: $wms-info; .status-dot { background: $wms-info; } }
.tag-neutral { background: $wms-neutral-soft; color: $wms-neutral; .status-dot { background: $wms-neutral; } }
.tag-brand   { background: $wms-brand-soft; color: $wms-brand; .status-dot { background: $wms-brand; } }
</style>