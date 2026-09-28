<template>
  <div class="production-progress-ring">
    <div class="ring-wrapper">
      <div ref="chartRef" class="ring-chart"></div>
      <div class="ring-center">
        <div class="ring-percent">{{ progress }}<span class="ring-unit">%</span></div>
        <div class="ring-ratio">{{ data.completed }} / {{ data.total }}</div>
      </div>
    </div>
    <div class="ring-meta">
      <div class="ring-name">{{ data.name }}</div>
      <div class="ring-order">订单号：{{ data.orderNo }}</div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

/**
 * ProductionProgressRing 生产线进度环形图
 * 用于生产线卡片中部、仪表盘进度展示
 * props.data: { name, orderNo, completed, total, progress }
 * 环宽 10px，环形色 #35604F，背景环 #EFEEE9
 */
export default {
  name: 'ProductionProgressRing',
  props: {
    /** 单个进度对象：{ name, orderNo, completed, total, progress } */
    data: { type: Object, default: () => ({}) },
    /** 环形尺寸 */
    size: { type: Number, default: 140 }
  },
  data() {
    return { chart: null }
  },
  computed: {
    progress() {
      const p = Number(this.data && this.data.progress)
      return isNaN(p) ? 0 : Math.max(0, Math.min(100, p))
    }
  },
  watch: {
    'data.progress'() {
      this.renderChart()
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
      const value = this.progress
      const remain = 100 - value
      const option = {
        series: [
          {
            type: 'pie',
            radius: [60, 70],
            center: ['50%', '50%'],
            silent: true,
            label: { show: false },
            labelLine: { show: false },
            animationDuration: 600,
            itemStyle: {
              borderRadius: 0
            },
            data: [
              { value: value, itemStyle: { color: '#35604F' } },
              { value: remain, itemStyle: { color: '#EFEEE9' } }
            ]
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
.production-progress-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ring-wrapper {
  position: relative;
  width: 140px;
  height: 140px;

  .ring-chart {
    width: 100%;
    height: 100%;
  }

  .ring-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .ring-percent {
    font-family: $wms-font-heading;
    font-size: $wms-fs-2xl;
    font-weight: 600;
    color: $wms-text;
    line-height: 1;

    .ring-unit {
      font-size: $wms-fs-md;
      color: $wms-text-2;
      margin-left: 2px;
    }
  }

  .ring-ratio {
    margin-top: 4px;
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }
}

.ring-meta {
  text-align: center;

  .ring-name {
    font-family: $wms-font-heading;
    font-size: $wms-fs-md;
    font-weight: 600;
    color: $wms-text;
  }

  .ring-order {
    margin-top: 2px;
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }
}
</style>
