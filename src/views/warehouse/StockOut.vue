<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">出库管理</h1>
      <p class="wms-page-desc">查看与处理仓库出库记录</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索货号 / 订单号 / 客户" clearable style="width:220px" @keyup.enter.native="onSearch" />
        <el-select v-model="query.outStatus" placeholder="出库状态" clearable style="width:140px">
          <el-option label="待出库" value="待出库" />
          <el-option label="已出库" value="已出库" />
        </el-select>
        <el-select v-model="query.warehouse" placeholder="仓库" clearable style="width:160px">
          <el-option v-for="w in warehouseOptions" :key="w" :label="w" :value="w" />
        </el-select>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="goodsNo" label="货号" min-width="170" />
        <el-table-column prop="orderNo" label="订单号" min-width="150" />
        <el-table-column prop="goodsName" label="货物名称" min-width="140" />
        <el-table-column prop="quantity" label="存储数量" width="100" align="right" />
        <el-table-column prop="customer" label="客户" min-width="140" />
        <el-table-column prop="inTime" label="入库时间" min-width="160" />
        <el-table-column prop="operator" label="操作员" width="110" />
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <StatusTag :status="row.outStatus" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="{ row }">
            <StockOutAction :row="row" @out="handleOut" />
          </template>
        </el-table-column>
        <template slot="empty">暂无出库记录</template>
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
 * 出库管理列表页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import StatusTag from '@/components/StatusTag.vue'
import StockOutAction from '@/components/business/StockOutAction.vue'
import { getStockOutList, stockOutSubmit } from '@/api/stock'
import { getAllWarehouses } from '@/api/warehouse'

export default {
  name: 'StockOut',
  components: { SearchFilterBar, StatusTag, StockOutAction },
  data() {
    return {
      loading: false,
      query: { keyword: '', outStatus: '', warehouse: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0,
      warehouseOptions: []
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
    this.loadWarehouses()
    this.loadData()
  },
  methods: {
    async loadWarehouses() {
      const res = await getAllWarehouses()
      this.warehouseOptions = (res || []).map(w => w.name)
    },
    onSearch() {
      this.query.page = 1
      this.loadData()
    },
    resetQuery() {
      this.query = { keyword: '', outStatus: '', warehouse: '', page: 1, pageSize: 10 }
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getStockOutList(this.query)
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
    handleOut(row) {
      // 业务逻辑待后端对接时完善：出库后回写仓库已使用面积、生成出库台账
      this.$confirm(`确认对「${row.goodsName}」执行出库？`, '出库确认', { type: 'warning' })
        .then(() => stockOutSubmit(row.id))
        .then(() => {
          this.$message.success('出库成功')
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
