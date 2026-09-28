<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="chart-title-group">
        <h3 class="chart-title">{{ title }}</h3>
        <span v-if="subtitle" class="chart-subtitle">{{ subtitle }}</span>
      </div>
      <div class="chart-actions">
        <slot name="actions" />
      </div>
    </div>
    <div ref="chartRef" class="chart-body" :style="{ height: height }"></div>
  </div>
</template>

<script>
/**
 * ChartCard 图表卡片容器
 * 提供标题 + 副标题 + 图表区域
 * 通过 ref 获取 DOM 并在父组件中初始化 ECharts 实例
 */
export default {
  name: 'ChartCard',
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    height: { type: String, default: '280px' }
  },
  mounted() {
    this.$emit('ready', this.$refs.chartRef)
  }
}
</script>

<style lang="scss" scoped>
.chart-card {
  background: $wms-panel;
  border: 1px solid $wms-border;
  border-radius: $wms-radius-md;
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 8px;

  .chart-title-group {
    .chart-title {
      font-family: $wms-font-heading;
      font-size: $wms-fs-lg;
      font-weight: 600;
      color: $wms-text;
      line-height: 1.3;
    }

    .chart-subtitle {
      display: block;
      margin-top: 2px;
      font-size: $wms-fs-sm;
      color: $wms-text-3;
    }
  }
}

.chart-body {
  width: 100%;
  padding: 0 8px 12px;
}
</style>