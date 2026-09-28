<template>
  <div class="order-status-tag">
    <StatusTag :status="payStatus" />
    <el-divider direction="vertical" class="order-divider" />
    <StatusTag :status="shipStatus" />
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'

/**
 * OrderStatusTag 订单状态标签组
 * 用于订单列表行展示「支付状态 + 发货状态」两个标签
 * 中间用垂直分隔线区分
 */
export default {
  name: 'OrderStatusTag',
  components: { StatusTag },
  props: {
    /** 支付状态：已付款 / 未付款 */
    payStatus: { type: String, default: '' },
    /** 发货状态：已发货 / 未发货 */
    shipStatus: { type: String, default: '' }
  }
}
</script>

<style lang="scss" scoped>
.order-status-tag {
  display: inline-flex;
  align-items: center;

  .order-divider {
    margin: 0 8px;
    height: 14px;
  }
}
</style>
