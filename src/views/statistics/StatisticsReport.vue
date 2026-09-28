<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">报表统计</h1>
      <p class="wms-page-desc">出入库趋势、订单状态分布与台账明细</p>
    </div>
    <div class="chart-row">
      <ChartCard title="出入库趋势" subtitle="近 6 个月入库 / 出库数量" height="320px" class="chart-item" @ready="onTrendReady" />
      <ChartCard title="订单状态分布" subtitle="当前订单各状态占比" height="320px" class="chart-item" @ready="onPieReady" />
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索货号 / 货物名称" clearable style="width:240px" @keyup.enter.native="onSearch" />
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <div class="wms-panel-header">
        <span class="wms-panel-title">出入库台账</span>
      </div>
      <el-table :data="ledger" v-loading="loading" border style="width:100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="goodsNo" label="货号" min-width="170" />
        <el-table-column label="类型" width="90" align="center">
          <template slot-scope="{ row }">
            <StatusTag :status="row.type" :type="row.type === '入库' ? 'success' : 'brand'" />
          </template>
        </el-table-column>
        <el-table-column prop="goodsName" label="货物名称" min-width="140" />
        <el-table-column prop="quantity" label="数量" width="90" align="right" />
        <el-table-column prop="warehouse" label="仓库" min-width="140" />
        <el-table-column prop="operator" label="操作员" width="120" />
        <template slot="empty">暂无台账记录</template>
      </el-table>
      <div class="wms-table-footer">
        <span class="wms-footer-info">{{ footerText }}</span>
        <el-pagination
          background
          layout="prev,pager,next,sizes,total"
          :current-page="query.page"
          :page-size="query.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          @current-change="onPage"
          @size-change="onSize"
        />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 报表统计页：出入库趋势分组柱状图 + 订单状态分布饼图 + 台账表格
 */
import * as echarts from 'echarts'
import ChartCard from '@/components/ChartCard.vue'
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import StatusTag from '@/components/StatusTag.vue'
import { getStockLedger } from '@/api/stock'

export default {
  name: 'StatisticsReport',
  components: { ChartCard, SearchFilterBar, StatusTag },
  data() {
    return {
      loading: false,
      query: { keyword: '', page: 1, pageSize: 10 },
      ledger: [],
      total: 0,
      trendChart: null,
      pieChart: null,
      resizeHandler: () => {
        if (this.trendChart) this.trendChart.resize()
        if (this.pieChart) this.pieChart.resize()
      }
    }
  },
  computed: {
    footerText() {
      const { total } = this
      const { page, pageSize } = this.query
      const from = total === 0 ? 0 : (page - 1) * pageSize + 1
      const to = Math.min(page * pageSize, total)
      return `共 ${total} 条记录，当前显示 ${from}-${to} 条`
    }
  },
  mounted() {
    this.loadData()
    window.addEventListener('resize', this.resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler)
    if (this.trendChart) this.trendChart.dispose()
    if (this.pieChart) this.pieChart.dispose()
  },
  methods: {
    onTrendReady(el) {
      this.trendChart = echarts.init(el)
      // 业务逻辑待后端对接时完善：趋势数据应由后端按月聚合返回，当前为示意数据
      this.trendChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['入库', '出库'], right: 10, top: 4, textStyle: { color: '#5B6068', fontSize: 12 } },
        grid: { left: 40, right: 20, top: 40, bottom: 28 },
        xAxis: {
          type: 'category',
          data: ['4月', '5月', '6月', '7月', '8月', '9月'],
          axisLine: { lineStyle: { color: '#D3D1CA' } },
          axisLabel: { color: '#5B6068', fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#E4E2DC' } },
          axisLabel: { color: '#5B6068', fontSize: 12 }
        },
        series: [
          {
            name: '入库',
            type: 'bar',
            barWidth: 14,
            itemStyle: { color: '#35604F', borderRadius: [3, 3, 0, 0] },
            data: [320, 410, 380, 460, 520, 480]
          },
          {
            name: '出库',
            type: 'bar',
            barWidth: 14,
            itemStyle: { color: '#93661B', borderRadius: [3, 3, 0, 0] },
            data: [260, 330, 360, 400, 470, 430]
          }
        ]
      })
    },
    onPieReady(el) {
      this.pieChart = echarts.init(el)
      // 业务逻辑待后端对接时完善：订单状态分布应由后端统计返回，当前为示意数据
      this.pieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 4, left: 'center', textStyle: { color: '#5B6068', fontSize: 12 } },
        series: [
          {
            type: 'pie',
            radius: ['42%', '62%'],
            center: ['50%', '46%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: '#FFFFFF', borderWidth: 2 },
            label: { show: false },
            data: [
              { value: 58, name: '已发货', itemStyle: { color: '#2F7A55' } },
              { value: 42, name: '已付款', itemStyle: { color: '#35604F' } },
              { value: 27, name: '生产中', itemStyle: { color: '#39618C' } },
              { value: 19, name: '待发货', itemStyle: { color: '#93661B' } }
            ]
          }
        ]
      })
    },
    onSearch() {
      this.query.page = 1
      this.loadData()
    },
    resetQuery() {
      this.query = { keyword: '', page: 1, pageSize: 10 }
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getStockLedger(this.query)
        this.ledger = res.list || []
        this.total = res.total || 0
      } finally {
        this.loading = false
      }
    },
    onPage(p) {
      this.query.page = p
      this.loadData()
    },
    onSize(s) {
      this.query.pageSize = s
      this.query.page = 1
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-head {
  margin-bottom: 16px;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
</style>
