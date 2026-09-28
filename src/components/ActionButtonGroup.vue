<template>
  <div class="action-btn-group">
    <el-button
      v-for="btn in visibleButtons"
      :key="btn.key"
      :type="btn.type || 'text'"
      :class="btn.danger ? 'wms-text-danger' : ''"
      size="small"
      @click="$emit('action', btn.key)"
    >
      {{ btn.label }}
    </el-button>
  </div>
</template>

<script>
/**
 * ActionButtonGroup 表格行内操作按钮组
 * 通过 actions prop 定义按钮列表
 */
export default {
  name: 'ActionButtonGroup',
  props: {
    actions: { type: Array, default: () => [] }
  },
  computed: {
    visibleButtons() {
      return this.actions.filter(btn => !btn.hidden)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-btn-group {
  display: flex;
  align-items: center;
  gap: 10px;

  ::v-deep .el-button--text {
    padding: 0;
    font-size: $wms-fs-125;
    color: $wms-brand;
  }

  ::v-deep .wms-text-danger {
    color: $wms-danger;
  }
}
</style>