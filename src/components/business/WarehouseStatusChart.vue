<template>
  <div ref="chartRef" class="warehouse-status-chart" :style="{ height: height }"></div>
</template>

<script>
import * as echarts from 'echarts'

/**
 * WarehouseStatusChart 仓库库存状态柱状图
 * 用于仪表盘：分组柱状图展示各仓库「已使用面积 / 总容量」
 * props.data: [{ code, usedArea, totalArea }]
 * 颜色：已使用 #35604F，总容量 #E7EFEB
 */
export default {
  name: 'WarehouseStatusChart',
  props: {
    /** 数据源：每项含 code, usedArea, totalArea */
    data: { type: Array, default: () => [] },
    /** 图表高度 */
    height: { type: String, default: '280px' }
  },
  data() {
    return { chart: null }
  },
  watch: {
    data: {
      handler() {
        this.renderChart()
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef)
      this.renderChart()
    },
    renderChart() {
      if (!this.chart) return
      const codes = (this.data || []).map(item => item.code || '')
      const usedArea = (this.data || []).map(item => item.usedArea || 0)
      const totalArea = (this.data || []).map(item => item.totalArea || 0)
      const option = {
        color: ['#35604F', '#E7EFEB'],
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#fff',
          borderColor: '#e4e2dc',
          textStyle: { color: '#22252b', fontSize: 12 },
          extraCssText: 'border-radius: 6px; box-shadow: 0 2px 8px rgba(34,37,43,0.06);'
        },
        legend: {
          data: ['已使用面积', '总容量'],
          top: 0,
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 24,
          textStyle: { color: '#5b6068', fontSize: 12 }
        },
        grid: { top: 40, left: 50, right: 20, bottom: 32 },
        xAxis: {
          type: 'category',
          data: codes,
          axisLine: { lineStyle: { color: '#e4e2dc' } },
          axisTick: { show: false },
          axisLabel: { color: '#5b6068', fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          name: '已使用面积 / 总容量（㎡）',
          nameTextStyle: { color: '#8b9099', fontSize: 11, padding: [0, 0, 4, 0] },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: '#efeee9', type: 'dashed' } },
          axisLabel: { color: '#8b9099', fontSize: 12 }
        },
        series: [
          {
            name: '已使用面积',
            type: 'bar',
            barWidth: 16,
            barGap: '20%',
            itemStyle: { color: '#35604F', borderRadius: [4, 4, 0, 0] },
            data: usedArea
          },
          {
            name: '总容量',
            type: 'bar',
            barWidth: 16,
            itemStyle: { color: '#E7EFEB', borderRadius: [4, 4, 0, 0] },
            data: totalArea
          }
        ]
      }
      this.chart.setOption(option, true)
    },
    handleResize() {
      if (this.chart) this.chart.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
.warehouse-status-chart {
  width: 100%;
}
</style>
