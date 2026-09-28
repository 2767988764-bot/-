<template>
  <div class="dashboard-page">
    <div class="wms-page-head">
      <div>
        <h1 class="wms-page-title">首页仪表盘</h1>
        <p class="wms-page-desc">仓储运营总览 · 数据更新于 {{ todayText }}</p>
      </div>
    </div>

    <!-- 第一行：统计卡片 -->
    <div class="stat-row">
      <div v-for="item in stats" :key="item.label" class="stat-card">
        <div class="stat-main">
          <div class="stat-value">{{ item.value }}<span class="stat-unit">{{ item.unit }}</span></div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
        <div class="stat-trend" :class="trendClass(item.trend)">
          <i :class="trendIcon(item.trend)"></i>
          <span>{{ item.trend }}</span>
        </div>
      </div>
    </div>

    <!-- 第二行：仓库柱状图 + 天气卡片 -->
    <div class="grid-row grid-2-1">
      <ChartCard
        title="仓库库存状态"
        subtitle="已使用面积 / 总容量（㎡）"
        height="320px"
        @ready="initWarehouseChart"
      >
        <template #actions>
          <span class="chart-tag">实时</span>
        </template>
      </ChartCard>
      <div class="weather-card wms-card">
        <div class="weather-head">
          <h3 class="weather-title">今日天气</h3>
          <span class="weather-city">{{ weather.city }}</span>
        </div>
        <div class="weather-body" v-loading="weatherLoading">
          <div class="weather-main">
            <div class="weather-temp">{{ weather.temperature }}<span class="temp-unit">°C</span></div>
            <div class="weather-meta">
              <div class="weather-name">{{ weather.weather }}</div>
              <div class="weather-date">{{ weather.date }}</div>
            </div>
          </div>
          <ul class="weather-detail">
            <li><span class="dk">湿度</span><span class="dv">{{ weather.humidity }}%</span></li>
            <li><span class="dk">风力</span><span class="dv">{{ weather.wind }}</span></li>
            <li class="full"><span class="dk">作业建议</span><span class="dv">{{ weather.suggestions }}</span></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 第三行：生产线进度 + 系统介绍 -->
    <div class="grid-row grid-2-1">
      <div class="wms-card production-card">
        <div class="wms-panel-header">
          <div class="wms-panel-title">
            <i class="el-icon-data-line"></i>
            <span>生产线进度</span>
            <span class="wms-panel-subtitle">3 条产线运行中</span>
          </div>
          <router-link class="more-link" to="/production/line">查看全部 ›</router-link>
        </div>
        <div class="production-rings" v-loading="productionLoading">
          <div v-for="line in production" :key="line.name" class="ring-item">
            <div :ref="`ring-${line.name}`" class="ring-canvas"></div>
            <div class="ring-info">
              <div class="ring-name">{{ line.name }}</div>
              <div class="ring-order">订单 {{ line.orderNo }}</div>
              <div class="ring-qty">
                <span class="num">{{ line.completed }}</span>
                <span class="sep">/</span>
                <span class="total">{{ line.total }}</span>
                <span class="unit">件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="wms-card intro-card">
        <div class="wms-panel-header">
          <div class="wms-panel-title">
            <i class="el-icon-info"></i>
            <span>系统介绍</span>
          </div>
        </div>
        <div class="intro-body">
          <p class="intro-text">
            仓储物流管理系统（WMS）覆盖订单、生产、入库、出库、盘点等核心业务流程，
            支持多仓库协同作业、实时库存可视化、订单全流程闭环追踪。
          </p>
          <ul class="intro-list">
            <li>
              <i class="el-icon-truck"></i>
              <div class="intro-item-content">
                <div class="intro-item-title">订单管理</div>
                <div class="intro-item-desc">下单、支付、发货、签收全流程可视</div>
              </div>
            </li>
            <li>
              <i class="el-icon-box"></i>
              <div class="intro-item-content">
                <div class="intro-item-title">仓库管理</div>
                <div class="intro-item-desc">入库登记、出库审批、库存盘点</div>
              </div>
            </li>
            <li>
              <i class="el-icon-setting"></i>
              <div class="intro-item-content">
                <div class="intro-item-title">系统配置</div>
                <div class="intro-item-desc">用户、角色、权限、菜单灵活分配</div>
              </div>
            </li>
          </ul>
          <div class="intro-version">当前版本 v1.0.0 · 2026</div>
        </div>
      </div>
    </div>

    <!-- 第四行：近期订单表格 -->
    <div class="wms-card recent-card">
      <div class="wms-panel-header">
        <div class="wms-panel-title">
          <i class="el-icon-tickets"></i>
          <span>近期订单</span>
          <span class="wms-panel-subtitle">最新 6 条</span>
        </div>
        <router-link class="more-link" to="/order/list">查看全部 ›</router-link>
      </div>
      <el-table :data="recentOrders" v-loading="orderLoading" border>
        <el-table-column prop="orderNo" label="订单编号" min-width="180" />
        <el-table-column prop="customer" label="客户" min-width="160" show-overflow-tooltip />
        <el-table-column prop="productName" label="商品名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column label="金额" width="130" align="right">
          <template #default="{ row }">
            <span class="amount">¥ {{ formatAmount(row.price * row.quantity) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="110" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.payStatus" />
          </template>
        </el-table-column>
        <el-table-column label="发货状态" width="110" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.shipStatus" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import ChartCard from '@/components/ChartCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  getDashboardStats,
  getWarehouseChart,
  getProductionChart,
  getDashboardOrders,
  getWeather
} from '@/api/dashboard'

export default {
  name: 'Dashboard',
  components: { ChartCard, StatusTag },
  data() {
    return {
      stats: [],
      weather: {
        city: '--',
        date: '',
        temperature: '--',
        weather: '',
        humidity: '--',
        wind: '',
        suggestions: ''
      },
      production: [],
      recentOrders: [],
      statsLoading: false,
      weatherLoading: false,
      productionLoading: false,
      orderLoading: false,
      chartInstances: []
    }
  },
  computed: {
    todayText() {
      const d = new Date()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
  },
  mounted() {
    this.loadAll()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.chartInstances.forEach(c => c && c.dispose && c.dispose())
    this.chartInstances = []
  },
  methods: {
    async loadAll() {
      this.loadStats()
      this.loadWeather()
      this.loadProduction()
      this.loadRecentOrders()
    },
    async loadStats() {
      this.statsLoading = true
      try {
        const data = await getDashboardStats()
        this.stats = data || []
      } finally {
        this.statsLoading = false
      }
    },
    async loadWeather() {
      this.weatherLoading = true
      try {
        const data = await getWeather()
        this.weather = data
      } finally {
        this.weatherLoading = false
      }
    },
    async loadProduction() {
      this.productionLoading = true
      try {
        const res = await getProductionChart()
        this.production = res.data || []
        this.$nextTick(() => this.renderRings())
      } finally {
        this.productionLoading = false
      }
    },
    async loadRecentOrders() {
      this.orderLoading = true
      try {
        const data = await getDashboardOrders()
        this.recentOrders = data || []
      } finally {
        this.orderLoading = false
      }
    },
    // 仓库柱状图（业务逻辑待后端对接时完善）
    async initWarehouseChart(el) {
      if (!el) return
      const res = await getWarehouseChart()
      const list = res.data || []
      const chart = echarts.init(el)
      this.chartInstances.push(chart)
      chart.setOption({
        grid: { top: 40, right: 24, bottom: 32, left: 48 },
        legend: {
          data: ['已使用', '总容量'],
          right: 8,
          top: 8,
          itemWidth: 12,
          itemHeight: 8,
          textStyle: { color: '#5B6068', fontSize: 12 }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#22252B',
          borderColor: '#22252B',
          textStyle: { color: '#fff', fontSize: 12 }
        },
        xAxis: {
          type: 'category',
          data: list.map(i => i.code),
          axisLine: { lineStyle: { color: '#E4E2DC' } },
          axisTick: { show: false },
          axisLabel: { color: '#5B6068', fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          name: '㎡',
          nameTextStyle: { color: '#8B9099', fontSize: 12 },
          splitLine: { lineStyle: { color: '#E4E2DC', type: 'dashed' } },
          axisLabel: { color: '#5B6068', fontSize: 12 }
        },
        series: [
          {
            name: '已使用',
            type: 'bar',
            data: list.map(i => i.usedArea),
            barWidth: 18,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#35604F' },
                { offset: 1, color: '#7FB69C' }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          },
          {
            name: '总容量',
            type: 'bar',
            data: list.map(i => i.totalArea),
            barWidth: 18,
            itemStyle: { color: '#EFEEE9', borderRadius: [4, 4, 0, 0] }
          }
        ]
      })
    },
    // 生产线进度环形图
    renderRings() {
      this.production.forEach(line => {
        const refKey = `ring-${line.name}`
        const el = this.$refs[refKey] && this.$refs[refKey][0]
        if (!el) return
        const existed = echarts.getInstanceByDom(el)
        if (existed) existed.dispose()
        const chart = echarts.init(el)
        this.chartInstances.push(chart)
        chart.setOption({
          series: [
            {
              type: 'pie',
              radius: ['62%', '82%'],
              avoidLabelOverlap: false,
              silent: true,
              label: { show: false },
              labelLine: { show: false },
              data: [
                {
                  value: line.progress,
                  name: '已完成',
                  itemStyle: {
                    color: line.progress >= 80 ? '#2F7A55' : line.progress >= 40 ? '#93661B' : '#AF4038'
                  }
                },
                {
                  value: 100 - line.progress,
                  name: '剩余',
                  itemStyle: { color: '#EFEEE9' }
                }
              ]
            }
          ],
          graphic: [
            {
              type: 'text',
              left: 'center',
              top: '42%',
              style: {
                text: `${line.progress}%`,
                fontSize: 22,
                fontWeight: 'bold',
                fill: '#22252B',
                fontFamily: 'Playfair Display, serif'
              }
            },
            {
              type: 'text',
              left: 'center',
              top: '62%',
              style: {
                text: '完成进度',
                fontSize: 11,
                fill: '#8B9099'
              }
            }
          ]
        })
      })
    },
    handleResize() {
      this.chartInstances.forEach(c => c && c.resize && c.resize())
    },
    formatAmount(num) {
      if (num == null) return '0.00'
      return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    trendClass(trend) {
      if (!trend) return 'trend-flat'
      if (String(trend).startsWith('+')) return 'trend-up'
      if (String(trend).startsWith('-')) return 'trend-down'
      return 'trend-flat'
    },
    trendIcon(trend) {
      if (!trend) return 'el-icon-minus'
      if (String(trend).startsWith('+')) return 'el-icon-top'
      if (String(trend).startsWith('-')) return 'el-icon-bottom'
      return 'el-icon-minus'
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 24px $wms-page-padding 40px;
  max-width: $wms-content-width;
  margin: 0 auto;
}

.wms-page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

/* 第一行：统计卡片 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  @include wms-card;
  padding: 20px 22px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.stat-main {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-family: $wms-font-heading;
  font-size: 34px;
  font-weight: 700;
  color: $wms-text;
  line-height: 1.1;

  .stat-unit {
    font-family: $wms-font-body;
    font-size: $wms-fs-md;
    font-weight: 500;
    color: $wms-text-2;
    margin-left: 4px;
  }
}

.stat-label {
  margin-top: 8px;
  font-size: $wms-fs-md;
  color: $wms-text-2;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: $wms-radius;
  font-size: $wms-fs-sm;
  font-weight: 500;
  height: 22px;
  line-height: 18px;
  white-space: nowrap;

  i {
    font-size: 12px;
  }

  &.trend-up {
    background: $wms-ok-soft;
    color: $wms-ok;
  }

  &.trend-down {
    background: $wms-danger-soft;
    color: $wms-danger;
  }

  &.trend-flat {
    background: $wms-neutral-soft;
    color: $wms-neutral;
  }
}

/* 网格行 */
.grid-row {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}

.grid-2-1 {
  grid-template-columns: 2fr 1fr;
}

/* 天气卡片 */
.weather-card {
  display: flex;
  flex-direction: column;
}

.weather-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 8px;

  .weather-title {
    font-family: $wms-font-heading;
    font-size: $wms-fs-lg;
    font-weight: 600;
    color: $wms-text;
  }

  .weather-city {
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }
}

.weather-body {
  padding: 6px 22px 22px;
  flex: 1;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed $wms-border;
  margin-bottom: 16px;
}

.weather-temp {
  font-family: $wms-font-heading;
  font-size: 48px;
  font-weight: 700;
  color: $wms-brand;
  line-height: 1;

  .temp-unit {
    font-size: $wms-fs-md;
    color: $wms-text-2;
    margin-left: 2px;
  }
}

.weather-meta {
  flex: 1;

  .weather-name {
    font-size: $wms-fs-md;
    color: $wms-text;
    font-weight: 500;
  }

  .weather-date {
    margin-top: 4px;
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }
}

.weather-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;

  li {
    display: flex;
    flex-direction: column;
    gap: 2px;

    &.full {
      grid-column: 1 / -1;
    }
  }

  .dk {
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }

  .dv {
    font-size: $wms-fs-base;
    color: $wms-text;
    font-weight: 500;
    line-height: 1.5;
  }
}

.chart-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  background: $wms-brand-soft;
  color: $wms-brand;
  border-radius: $wms-radius-sm;
  font-size: $wms-fs-11;
  font-weight: 500;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $wms-ok;
    margin-right: 4px;
  }
}

/* 生产线进度卡片 */
.production-card {
  display: flex;
  flex-direction: column;
}

.production-rings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 20px 22px;
  flex: 1;
}

.ring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 8px;
  background: $wms-panel-3;
  border-radius: $wms-radius-md;
}

.ring-canvas {
  width: 100%;
  height: 160px;
}

.ring-info {
  text-align: center;
}

.ring-name {
  font-family: $wms-font-heading;
  font-size: $wms-fs-md;
  font-weight: 600;
  color: $wms-text;
}

.ring-order {
  margin-top: 2px;
  font-size: $wms-fs-11;
  color: $wms-text-3;
  font-family: 'Geist Mono', monospace;
}

.ring-qty {
  margin-top: 6px;
  font-size: $wms-fs-base;

  .num {
    font-family: $wms-font-heading;
    font-weight: 700;
    color: $wms-brand;
    font-size: $wms-fs-md;
  }

  .sep {
    color: $wms-text-3;
    margin: 0 2px;
  }

  .total {
    color: $wms-text-2;
  }

  .unit {
    color: $wms-text-3;
    margin-left: 2px;
  }
}

/* 系统介绍卡片 */
.intro-body {
  padding: 6px 22px 22px;
}

.intro-text {
  font-size: $wms-fs-sm;
  color: $wms-text-2;
  line-height: 1.7;
  padding-bottom: 16px;
  border-bottom: 1px dashed $wms-border;
  margin-bottom: 14px;
}

.intro-list {
  display: flex;
  flex-direction: column;
  gap: 14px;

  li {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    i {
      width: 28px;
      height: 28px;
      border-radius: $wms-radius-sm;
      background: $wms-brand-soft;
      color: $wms-brand;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $wms-fs-md;
      flex-shrink: 0;
    }
  }

  .intro-item-title {
    font-size: $wms-fs-base;
    color: $wms-text;
    font-weight: 500;
  }

  .intro-item-desc {
    margin-top: 2px;
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }
}

.intro-version {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed $wms-border;
  font-size: $wms-fs-11;
  color: $wms-text-3;
  text-align: center;
  font-family: 'Geist Mono', monospace;
}

.more-link {
  font-size: $wms-fs-sm;
  color: $wms-brand;
  font-weight: 500;

  &:hover {
    color: $wms-brand-hover;
  }
}

/* 近期订单卡片 */
.recent-card {
  .el-table {
    border-radius: 0 0 $wms-radius-md $wms-radius-md;
  }

  .amount {
    font-family: 'Geist Mono', monospace;
    color: $wms-text;
    font-weight: 500;
  }
}

@media (max-width: 1100px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid-2-1 {
    grid-template-columns: 1fr;
  }
  .production-rings {
    grid-template-columns: 1fr;
  }
}
</style>
