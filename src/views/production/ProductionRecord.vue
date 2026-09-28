<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">生产档案</h1>
      <p class="wms-page-desc">查看各生产线的产出记录与产品入库状态</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索订单号 / 产品名称" clearable style="width:220px" @keyup.enter.native="loadData" />
        <el-select v-model="query.productStatus" placeholder="产品状态" clearable style="width:140px">
          <el-option v-for="s in productStatusOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select v-model="query.line" placeholder="生产线" clearable style="width:160px">
          <el-option v-for="l in lineOptions" :key="l" :label="l" :value="l" />
        </el-select>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="orderNo" label="订单号" min-width="160" />
        <el-table-column prop="productName" label="产品名称" min-width="140" />
        <el-table-column prop="planQuantity" label="计划数量" width="100" align="right" />
        <el-table-column prop="actualQuantity" label="实际完成" width="100" align="right" />
        <el-table-column prop="line" label="所属生产线" width="130" />
        <el-table-column label="产品状态" width="110" align="center">
          <template slot-scope="{ row }">
            <StatusTag :status="row.productStatus" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template slot-scope="{ row }">
            <div class="wms-row-actions">
              <el-button type="text" :disabled="row.productStatus === '已入库'" @click="handleInStock(row)">入库</el-button>
              <el-button type="text" @click="handleComplete(row)">标记完成</el-button>
              <el-button type="text" class="wms-text-danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        <template slot="empty">暂无生产档案数据</template>
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
 * 生产档案列表页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  getProductionRecords,
  markProductInStock,
  markProductComplete,
  deleteProductionRecord,
  PRODUCT_STATUS
} from '@/api/production'

export default {
  name: 'ProductionRecord',
  components: { SearchFilterBar, StatusTag },
  data() {
    return {
      loading: false,
      query: { keyword: '', productStatus: '', line: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0,
      productStatusOptions: [PRODUCT_STATUS.NOT_IN, PRODUCT_STATUS.IN_STOCK],
      lineOptions: ['一号生产线', '二号生产线', '三号生产线']
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
  },
  methods: {
    onSearch() {
      this.query.page = 1
      this.loadData()
    },
    resetQuery() {
      this.query = { keyword: '', productStatus: '', line: '', page: 1, pageSize: 10 }
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getProductionRecords(this.query)
        this.tableData = res.list || []
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
    },
    handleInStock(row) {
      // 业务逻辑待后端对接时完善：入库后可联动仓库已使用面积
      markProductInStock(row.id).then(() => {
        this.$message.success('已标记入库')
        this.loadData()
      })
    },
    handleComplete(row) {
      this.$confirm('确认标记该档案完成？', '提示', { type: 'warning' })
        .then(() => markProductComplete(row.id))
        .then(() => {
          this.$message.success('已标记完成')
          this.loadData()
        })
        .catch(() => {})
    },
    handleDelete(row) {
      this.$confirm('确认删除该生产档案？删除后不可恢复。', '提示', { type: 'warning' })
        .then(() => deleteProductionRecord(row.id))
        .then(() => {
          this.$message.success('删除成功')
          this.loadData()
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
</style>
