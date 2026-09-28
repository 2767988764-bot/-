<template>
  <div class="warehouse-card">
    <div class="card-header">
      <div class="header-title">
        <h3 class="warehouse-name">{{ warehouse.name }}</h3>
        <el-tag size="mini" :type="typeTagType" effect="plain" class="type-tag">
          {{ warehouse.type }}
        </el-tag>
      </div>
      <el-dropdown trigger="click" @command="onCommand">
        <span class="action-trigger">
          <i class="el-icon-more"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="edit">编辑</el-dropdown-item>
          <el-dropdown-item command="toggle">
            {{ warehouse.status === 1 ? '停用' : '启用' }}
          </el-dropdown-item>
          <el-dropdown-item command="ledger">出入库台账</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <div class="card-ring">
      <div class="ring-wrapper">
        <div ref="chartRef" class="ring-chart"></div>
        <div class="ring-center">
          <div class="ring-percent">{{ usageRate }}<span class="ring-unit">%</span></div>
          <div class="ring-label">使用率</div>
        </div>
      </div>
    </div>

    <div class="card-info">
      <div class="info-row">
        <span class="info-label">仓库编号</span>
        <span class="info-value">{{ warehouse.code }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">总面积</span>
        <span class="info-value">{{ warehouse.totalArea }} ㎡</span>
      </div>
      <div class="info-row">
        <span class="info-label">已用面积</span>
        <span class="info-value info-used">{{ warehouse.usedArea }} ㎡</span>
      </div>
      <div class="info-row">
        <span class="info-label">可用面积</span>
        <span class="info-value info-free">{{ warehouse.usableArea }} ㎡</span>
      </div>
      <div class="info-row">
        <span class="info-label">地址</span>
        <span class="info-value text-ellipsis">{{ warehouse.address }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">管理员</span>
        <span class="info-value">{{ warehouse.manager }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">电话</span>
        <span class="info-value">{{ warehouse.phone }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

/**
 * WarehouseCard 仓库容量卡片
 * 用于我的仓库页：顶部仓库名称+类型标签，中部使用率环形图，底部信息列表，操作下拉
 * props.warehouse: { code, name, type, totalArea, usedArea, usableArea, usageRate, address, manager, phone, status }
 */
export default {
  name: 'WarehouseCard',
  props: {
    /** 仓库对象 */
    warehouse: { type: Object, default: () => ({}) }
  },
  data() {
    return { chart: null }
  },
  computed: {
    usageRate() {
      const r = Number(this.warehouse && this.warehouse.usageRate)
      return isNaN(r) ? 0 : Math.max(0, Math.min(100, r))
    },
    typeTagType() {
      const type = this.warehouse && this.warehouse.type
      if (type === '待检库') return 'warning'
      if (type === '废品库') return 'danger'
      return 'info'
    }
  },
  watch: {
    'warehouse.usageRate'() {
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
      const value = this.usageRate
      const remain = 100 - value
      const option = {
        series: [
          {
            type: 'pie',
            radius: [50, 60],
            center: ['50%', '50%'],
            silent: true,
            label: { show: false },
            labelLine: { show: false },
            animationDuration: 600,
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
    },
    onCommand(command) {
      // 业务逻辑待后端对接时完善：编辑/启停/台账跳转
      this.$emit(command, this.warehouse)
    }
  }
}
</script>

<style lang="scss" scoped>
.warehouse-card {
  @include wms-card;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    @include wms-ellipsis;

    .warehouse-name {
      font-family: $wms-font-heading;
      font-size: $wms-fs-lg;
      font-weight: 600;
      color: $wms-text;
      line-height: 1.3;
    }

    .type-tag {
      flex-shrink: 0;
      border-radius: $wms-radius;
    }
  }

  .action-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: $wms-radius;
    cursor: pointer;
    color: $wms-text-2;
    transition: background 0.15s;

    &:hover {
      background: $wms-panel-3;
      color: $wms-brand;
    }

    i {
      font-size: 14px;
    }
  }
}

.card-ring {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.ring-wrapper {
  position: relative;
  width: 120px;
  height: 120px;

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
    pointer-events: none;
  }

  .ring-percent {
    font-family: $wms-font-heading;
    font-size: $wms-fs-xl;
    font-weight: 600;
    color: $wms-text;
    line-height: 1;

    .ring-unit {
      font-size: $wms-fs-sm;
      color: $wms-text-2;
      margin-left: 2px;
    }
  }

  .ring-label {
    margin-top: 4px;
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid $wms-border;

  .info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: $wms-fs-base;

    .info-label {
      flex: 0 0 64px;
      color: $wms-text-3;
    }

    .info-value {
      color: $wms-text;
      font-weight: 500;
    }

    .info-used {
      color: $wms-warn;
    }

    .info-free {
      color: $wms-ok;
    }

    .text-ellipsis {
      @include wms-ellipsis;
    }
  }
}
</style>
