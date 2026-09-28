<template>
  <div class="wms-page">
    <div class="page-head">
      <div>
        <h1 class="wms-page-title">我的生产</h1>
        <p class="wms-page-desc">实时查看各生产线运行进度与完成情况</p>
      </div>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索生产线 / 订单号" clearable style="width:240px" @keyup.enter.native="loadData" />
        <el-button type="primary" @click="loadData">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
      <template #actions>
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增生产线</el-button>
      </template>
    </SearchFilterBar>
    <div v-loading="loading" class="line-grid">
      <div v-for="item in list" :key="item.id" class="line-card">
        <div class="line-card-head">
          <div class="line-name-group">
            <h3 class="line-name">{{ item.name }}</h3>
            <StatusTag :status="item.status" />
          </div>
          <span class="line-order">{{ item.orderNo }}</span>
        </div>
        <div class="line-card-body">
          <div ref="ringChart" class="ring-chart"></div>
          <div class="line-meta">
            <div class="meta-row"><span class="meta-label">产品</span><span class="meta-value">{{ item.goodsName }}</span></div>
            <div class="meta-row"><span class="meta-label">计划</span><span class="meta-value">{{ item.planQuantity }} 件</span></div>
            <div class="meta-row"><span class="meta-label">完成</span><span class="meta-value wms-strong">{{ item.completedQuantity }} 件</span></div>
            <div class="meta-row"><span class="meta-label">创建</span><span class="meta-value">{{ item.createTime }}</span></div>
          </div>
        </div>
        <p class="line-desc">{{ item.description }}</p>
        <div class="line-card-foot">
          <el-button size="small" @click="openEdit(item)">编辑</el-button>
          <el-button v-if="item.status !== '运行中' && item.status !== '已完成'" size="small" type="primary" @click="handleStart(item)">开始</el-button>
          <el-button v-if="item.status === '运行中'" size="small" type="success" @click="handleComplete(item)">完成</el-button>
        </div>
      </div>
      <div v-if="!loading && !list.length" class="empty-state">暂无生产线数据</div>
    </div>
    <ModalForm :visible.sync="dialogVisible" :title="dialogTitle" :model="form" :rules="rules" width="520px" @submit="handleSubmit">
      <el-form-item label="生产线名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入生产线名称" />
      </el-form-item>
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="form.orderNo" placeholder="请输入关联订单号" />
      </el-form-item>
      <el-form-item label="产品名称" prop="goodsName">
        <el-input v-model="form.goodsName" placeholder="请输入产品名称" />
      </el-form-item>
      <el-form-item label="计划数量" prop="planQuantity">
        <el-input-number v-model="form.planQuantity" :min="1" controls-position="right" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入生产线描述" />
      </el-form-item>
    </ModalForm>
  </div>
</template>

<script>
/**
 * 我的生产页：生产线卡片列表 + 环形进度 + 操作按钮
 */
import * as echarts from 'echarts'
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  getProductionLines,
  addProductionLine,
  updateProductionLine,
  startProduction,
  completeProduction
} from '@/api/production'

export default {
  name: 'MyProduction',
  components: { SearchFilterBar, ModalForm, StatusTag },
  data() {
    return {
      loading: false,
      query: { keyword: '' },
      list: [],
      charts: [],
      dialogVisible: false,
      dialogTitle: '新增生产线',
      form: this.buildForm(),
      rules: {
        name: [{ required: true, message: '请输入生产线名称', trigger: 'blur' }],
        orderNo: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
        goodsName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
        planQuantity: [{ required: true, message: '请输入计划数量', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadData()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    this.disposeCharts()
  },
  methods: {
    buildForm() {
      return { id: null, name: '', orderNo: '', goodsName: '', planQuantity: 100, description: '' }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getProductionLines(this.query)
        this.list = res || []
        this.$nextTick(() => this.initCharts())
      } finally {
        this.loading = false
      }
    },
    resetQuery() {
      this.query.keyword = ''
      this.loadData()
    },
    initCharts() {
      this.disposeCharts()
      const refs = this.$refs.ringChart || []
      refs.forEach((el, i) => {
        const item = this.list[i]
        if (!el || !item) return
        const chart = echarts.init(el)
        const progress = Math.max(0, Math.min(100, item.progress || 0))
        chart.setOption({
          series: [
            {
              type: 'pie',
              radius: ['72%', '88%'],
              silent: true,
              avoidLabelOverlap: false,
              label: { show: false },
              labelLine: { show: false },
              data: [
                { value: progress, itemStyle: { color: '#35604F' } },
                { value: 100 - progress, itemStyle: { color: '#EFEEE9' } }
              ]
            }
          ],
          graphic: {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: progress + '%',
              fontSize: 18,
              fontWeight: 600,
              fill: '#22252B',
              textAlign: 'center'
            }
          }
        })
        this.charts.push(chart)
      })
    },
    disposeCharts() {
      this.charts.forEach(c => c && c.dispose())
      this.charts = []
    },
    resizeCharts() {
      this.charts.forEach(c => c && c.resize())
    },
    openAdd() {
      this.dialogTitle = '新增生产线'
      this.form = this.buildForm()
      this.dialogVisible = true
    },
    openEdit(item) {
      this.dialogTitle = '编辑生产线'
      this.form = { ...item }
      this.dialogVisible = true
    },
    handleSubmit(done) {
      // 业务逻辑待后端对接时完善：编辑时保留完成进度，新增默认从0开始
      const save = this.form.id ? updateProductionLine(this.form) : addProductionLine(this.form)
      save
        .then(() => {
          this.$message.success('保存成功')
          done()
          this.loadData()
        })
        .catch(() => done())
    },
    handleStart(item) {
      startProduction(item.id).then(() => {
        this.$message.success('已开始生产')
        this.loadData()
      })
    },
    handleComplete(item) {
      this.$confirm('确认完成该生产线？完成后将标记为已完成。', '提示', { type: 'warning' })
        .then(() => {
          completeProduction(item.id).then(() => {
            this.$message.success('已完成生产')
            this.loadData()
          })
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.page-head {
  margin-bottom: 16px;
}

.line-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  min-height: 200px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: $wms-text-3;
  font-size: $wms-fs-sm;
  background: $wms-panel;
  border: 1px solid $wms-border;
  border-radius: $wms-radius-md;
}

.line-card {
  @include wms-card;
  display: flex;
  flex-direction: column;
  padding: 18px 20px 16px;
}

.line-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $wms-border;
  padding-bottom: 12px;
  margin-bottom: 14px;

  .line-name-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .line-name {
    font-family: $wms-font-heading;
    font-size: $wms-fs-md;
    font-weight: 600;
    color: $wms-text;
  }

  .line-order {
    font-size: $wms-fs-sm;
    color: $wms-text-3;
    font-family: 'Geist Mono', Consolas, monospace;
  }
}

.line-card-body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ring-chart {
  width: 110px;
  height: 110px;
  flex-shrink: 0;
}

.line-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-row {
  display: flex;
  align-items: center;
  font-size: $wms-fs-sm;

  .meta-label {
    width: 36px;
    color: $wms-text-3;
    flex-shrink: 0;
  }

  .meta-value {
    color: $wms-text-2;
  }
}

.line-desc {
  margin: 14px 0 16px;
  font-size: $wms-fs-sm;
  color: $wms-text-3;
  line-height: 1.6;
  min-height: 36px;
}

.line-card-foot {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid $wms-border;
}
</style>
