<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">我的仓库</h1>
      <p class="wms-page-desc">实时掌握各仓库容量与出入库明细</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索货号 / 货物名称" clearable style="width:220px" @keyup.enter.native="loadLedger" />
        <el-button type="primary" @click="onSearchLedger">搜索</el-button>
        <el-button @click="resetLedger">重置</el-button>
      </template>
      <template #actions>
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">新建仓库</el-button>
        <el-button icon="el-icon-refresh" @click="loadWarehouses">刷新仓库</el-button>
      </template>
    </SearchFilterBar>
    <ModalForm :visible.sync="dialogVisible" :title="dialogTitle" :model="form" :rules="rules" width="520px" @submit="handleSubmit">
      <el-form-item label="仓库编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入仓库编码" />
      </el-form-item>
      <el-form-item label="仓库名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入仓库名称" />
      </el-form-item>
      <el-form-item label="仓库类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择仓库类型" style="width:100%">
          <el-option v-for="t in WAREHOUSE_TYPES" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item label="总面积" prop="totalArea">
        <el-input-number v-model="form.totalArea" :min="0" :precision="2" :step="100" controls-position="right" style="width:100%" />
      </el-form-item>
      <el-form-item label="已用面积" prop="usedArea">
        <el-input-number v-model="form.usedArea" :min="0" :precision="2" :step="10" controls-position="right" style="width:100%" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入仓库地址" />
      </el-form-item>
      <el-form-item label="负责人" prop="manager">
        <el-input v-model="form.manager" placeholder="请输入负责人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
    </ModalForm>
    <div v-loading="whLoading" class="wh-grid">
      <div v-for="item in warehouses" :key="item.id" class="wh-card">
        <div class="wh-card-head">
          <div class="wh-name-group">
            <h3 class="wh-name">{{ item.name }}</h3>
            <span class="wh-type-tag">{{ item.type }}</span>
          </div>
          <span class="wh-code">{{ item.code }}</span>
        </div>
        <div class="wh-card-body">
          <div ref="usageChart" class="usage-chart"></div>
          <div class="wh-info">
            <div class="info-row"><span class="info-label">总面积</span><span class="info-value">{{ item.totalArea }} ㎡</span></div>
            <div class="info-row"><span class="info-label">已用</span><span class="info-value">{{ item.usedArea }} ㎡</span></div>
            <div class="info-row"><span class="info-label">可用</span><span class="info-value wms-strong">{{ item.usableArea }} ㎡</span></div>
          </div>
        </div>
        <div class="wh-card-foot">
          <div class="foot-row"><span class="foot-label">管理员</span><span class="foot-value">{{ item.manager }}</span></div>
          <div class="foot-row"><span class="foot-label">地址</span><span class="foot-value" :title="item.address">{{ item.address }}</span></div>
        </div>
      </div>
      <div v-if="!whLoading && !warehouses.length" class="empty-state">暂无仓库数据</div>
    </div>
    <div class="wms-card">
      <div class="wms-panel-header">
        <span class="wms-panel-title">出入库台账</span>
      </div>
      <el-table :data="ledger" v-loading="ledgerLoading" border style="width:100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="goodsNo" label="货号" min-width="170" />
        <el-table-column label="类型" width="80" align="center">
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
        <span class="wms-footer-info">{{ ledgerFooterText }}</span>
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
 * 我的仓库页：仓库卡片网格 + ECharts 使用率环形图 + 出入库台账表格
 */
import * as echarts from 'echarts'
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import { getAllWarehouses, addWarehouse, WAREHOUSE_TYPES } from '@/api/warehouse'
import { getStockLedger } from '@/api/stock'

export default {
  name: 'MyWarehouse',
  components: { SearchFilterBar, ModalForm, StatusTag },
  data() {
    return {
      whLoading: false,
      ledgerLoading: false,
      warehouses: [],
      usageCharts: [],
      ledger: [],
      total: 0,
      query: { keyword: '', page: 1, pageSize: 10 },
      dialogVisible: false,
      dialogTitle: '新建仓库',
      WAREHOUSE_TYPES,
      form: this.buildForm(),
      rules: {
        code: [{ required: true, message: '请输入仓库编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择仓库类型', trigger: 'change' }]
      }
    }
  },
  computed: {
    ledgerFooterText() {
      const { total } = this
      const { page, pageSize } = this.query
      const from = total === 0 ? 0 : (page - 1) * pageSize + 1
      const to = Math.min(page * pageSize, total)
      return `共 ${total} 条记录，当前显示 ${from}-${to} 条`
    }
  },
  mounted() {
    this.loadWarehouses()
    this.loadLedger()
    window.addEventListener('resize', this.resizeUsageCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeUsageCharts)
    this.disposeUsageCharts()
  },
  methods: {
    buildForm() {
      return { id: null, code: '', name: '', type: '', totalArea: 0, usedArea: 0, address: '', manager: '', phone: '' }
    },
    openAdd() {
      this.dialogTitle = '新建仓库'
      this.form = this.buildForm()
      this.dialogVisible = true
    },
    handleSubmit(done) {
      addWarehouse(this.form)
        .then(() => {
          this.$message.success('仓库创建成功')
          done()
          this.loadWarehouses()
        })
        .catch(() => done())
    },
    async loadWarehouses() {
      this.whLoading = true
      try {
        const res = await getAllWarehouses()
        this.warehouses = res || []
        this.$nextTick(() => this.initUsageCharts())
      } finally {
        this.whLoading = false
      }
    },
    initUsageCharts() {
      this.disposeUsageCharts()
      const refs = this.$refs.usageChart || []
      refs.forEach((el, i) => {
        const item = this.warehouses[i]
        if (!el || !item) return
        const rate = Math.max(0, Math.min(100, item.usageRate || 0))
        const chart = echarts.init(el)
        chart.setOption({
          series: [
            {
              type: 'pie',
              radius: ['70%', '86%'],
              silent: true,
              avoidLabelOverlap: false,
              label: { show: false },
              labelLine: { show: false },
              data: [
                { value: rate, itemStyle: { color: '#35604F' } },
                { value: 100 - rate, itemStyle: { color: '#EFEEE9' } }
              ]
            }
          ],
          graphic: {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: rate + '%',
              fontSize: 16,
              fontWeight: 600,
              fill: '#22252B',
              textAlign: 'center'
            }
          }
        })
        this.usageCharts.push(chart)
      })
    },
    disposeUsageCharts() {
      this.usageCharts.forEach(c => c && c.dispose())
      this.usageCharts = []
    },
    resizeUsageCharts() {
      this.usageCharts.forEach(c => c && c.resize())
    },
    onSearchLedger() {
      this.query.page = 1
      this.loadLedger()
    },
    resetLedger() {
      this.query.keyword = ''
      this.query.page = 1
      this.loadLedger()
    },
    async loadLedger() {
      this.ledgerLoading = true
      try {
        const res = await getStockLedger(this.query)
        this.ledger = res.list || []
        this.total = res.total || 0
      } finally {
        this.ledgerLoading = false
      }
    },
    onPage(p) {
      this.query.page = p
      this.loadLedger()
    },
    onSize(s) {
      this.query.pageSize = s
      this.query.page = 1
      this.loadLedger()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-head {
  margin-bottom: 16px;
}

.wh-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  min-height: 180px;
  margin-bottom: 16px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  color: $wms-text-3;
  font-size: $wms-fs-sm;
  background: $wms-panel;
  border: 1px solid $wms-border;
  border-radius: $wms-radius-md;
}

.wh-card {
  @include wms-card;
  padding: 18px 20px 16px;
}

.wh-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $wms-border;
  padding-bottom: 12px;
  margin-bottom: 16px;

  .wh-name-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wh-name {
    font-family: $wms-font-heading;
    font-size: $wms-fs-md;
    font-weight: 600;
    color: $wms-text;
  }

  .wh-type-tag {
    display: inline-block;
    padding: 1px 8px;
    height: 20px;
    line-height: 18px;
    font-size: $wms-fs-sm;
    color: $wms-brand;
    background: $wms-brand-soft;
    border-radius: $wms-radius;
  }

  .wh-code {
    font-size: $wms-fs-sm;
    color: $wms-text-3;
    font-family: 'Geist Mono', Consolas, monospace;
  }
}

.wh-card-body {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 16px;
}

.usage-chart {
  width: 110px;
  height: 110px;
  flex-shrink: 0;
}

.wh-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: $wms-fs-sm;

  .info-label {
    width: 44px;
    color: $wms-text-3;
  }

  .info-value {
    color: $wms-text-2;
  }
}

.wh-card-foot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid $wms-border;
}

.foot-row {
  display: flex;
  align-items: center;
  font-size: $wms-fs-sm;

  .foot-label {
    width: 56px;
    color: $wms-text-3;
    flex-shrink: 0;
  }

  .foot-value {
    color: $wms-text-2;
    @include wms-ellipsis;
  }
}
</style>
