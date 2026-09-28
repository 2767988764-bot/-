<template>
  <div class="stock-out-action">
    <el-button
      v-if="isOut"
      type="info"
      size="mini"
      plain
      disabled
    >
      已出库
    </el-button>
    <el-button
      v-else
      type="primary"
      size="mini"
      @click="handleOut"
    >
      出库
    </el-button>
  </div>
</template>

<script>
/**
 * StockOutAction 出库操作按钮
 * 用于出库单列表行的操作列
 * 已出库记录显示禁用按钮，未出库记录点击触发 out 事件
 */
export default {
  name: 'StockOutAction',
  props: {
    /** 出库单行数据，需包含 outStatus 字段 */
    row: { type: Object, default: () => ({}) }
  },
  computed: {
    isOut() {
      return this.row && this.row.outStatus === '已出库'
    }
  },
  methods: {
    handleOut() {
      // 业务逻辑待后端对接时完善：调用 stockOutSubmit 后刷新列表
      this.$emit('out', this.row)
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-out-action {
  display: inline-flex;
  align-items: center;
}
</style>
