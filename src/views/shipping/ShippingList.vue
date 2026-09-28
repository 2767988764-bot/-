<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">发货管理</h1>
      <p class="wms-page-desc">管理发货单据，确认发货并填写物流信息</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索发货单号 / 订单号 / 客户" clearable style="width:240px" @keyup.enter.native="onSearch" />
        <el-select v-model="query.status" placeholder="状态" clearable style="width:140px">
          <el-option v-for="s in SHIP_ORDER_STATUS" :key="s" :label="s" :value="s" />
        </el-select>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="shippingNo" label="发货单号" min-width="160" />
        <el-table-column prop="orderNo" label="订单号" min-width="150" />
        <el-table-column prop="customer" label="客户" min-width="140" />
        <el-table-column prop="goods" label="货物" min-width="140" />
        <el-table-column prop="quantity" label="数量" width="90" align="right" />
        <el-table-column prop="logistics" label="物流公司" width="120" />
        <el-table-column prop="trackingNo" label="运单号" min-width="150" />
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template slot-scope="{ row }">
            <div class="wms-row-actions">
              <el-button type="text" :disabled="row.status !== '待发货'" @click="openConfirm(row)">确认发货</el-button>
              <el-button type="text" class="wms-text-danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        <template slot="empty">暂无发货单</template>
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
    <ModalForm :visible.sync="dialogVisible" title="确认发货" :model="form" :rules="rules" width="460px" @submit="handleConfirm">
      <el-form-item label="发货单号">
        <el-input :value="form.shippingNo" disabled />
      </el-form-item>
      <el-form-item label="物流公司" prop="logistics">
        <el-select v-model="form.logistics" placeholder="请选择物流公司" style="width:100%">
          <el-option v-for="c in LOGISTICS_COMPANIES" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>
      <el-form-item label="运单号" prop="trackingNo">
        <el-input v-model="form.trackingNo" placeholder="请输入物流运单号" />
      </el-form-item>
    </ModalForm>
  </div>
</template>

<script>
/**
 * 发货管理列表页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import { getShippingList, confirmShipping, deleteShipping, LOGISTICS_COMPANIES, SHIP_ORDER_STATUS } from '@/api/shipping'

export default {
  name: 'ShippingList',
  components: { SearchFilterBar, ModalForm, StatusTag },
  data() {
    return {
      loading: false,
      query: { keyword: '', status: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0,
      LOGISTICS_COMPANIES,
      SHIP_ORDER_STATUS,
      dialogVisible: false,
      form: { id: null, shippingNo: '', logistics: '', trackingNo: '' },
      rules: {
        logistics: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
        trackingNo: [{ required: true, message: '请输入运单号', trigger: 'blur' }]
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
  },
  methods: {
    onSearch() {
      this.query.page = 1
      this.loadData()
    },
    resetQuery() {
      this.query = { keyword: '', status: '', page: 1, pageSize: 10 }
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getShippingList(this.query)
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
    openConfirm(row) {
      this.form = {
        id: row.id,
        shippingNo: row.shippingNo,
        logistics: row.logistics || '',
        trackingNo: row.trackingNo || ''
      }
      this.dialogVisible = true
    },
    handleConfirm(done) {
      // 业务逻辑待后端对接时完善：确认发货后状态变为运输中
      confirmShipping(this.form.id, { logistics: this.form.logistics, trackingNo: this.form.trackingNo })
        .then(() => {
          this.$message.success('发货确认成功')
          done()
          this.loadData()
        })
        .catch(() => done())
    },
    handleDelete(row) {
      this.$confirm('确认删除该发货单？删除后不可恢复。', '提示', { type: 'warning' })
        .then(() => deleteShipping(row.id))
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
