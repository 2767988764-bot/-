<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">入库管理</h1>
      <p class="wms-page-desc">查看与登记仓库入库记录</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索货号 / 订单号 / 货物" clearable style="width:220px" @keyup.enter.native="onSearch" />
        <el-select v-model="query.warehouse" placeholder="仓库" clearable style="width:160px">
          <el-option v-for="w in warehouseOptions" :key="w" :label="w" :value="w" />
        </el-select>
        <el-select v-model="query.inType" placeholder="入库类型" clearable style="width:140px">
          <el-option v-for="t in STOCK_IN_TYPES" :key="t" :label="t" :value="t" />
        </el-select>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
      <template #actions>
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">入库登记</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="goodsNo" label="货号" min-width="170" />
        <el-table-column prop="orderNo" label="订单号" min-width="150" />
        <el-table-column prop="goodsName" label="货物名称" min-width="140" />
        <el-table-column prop="warehouse" label="仓库" min-width="140" />
        <el-table-column prop="quantity" label="存储数量" width="100" align="right" />
        <el-table-column prop="customer" label="客户" min-width="140" />
        <el-table-column prop="inTime" label="入库时间" min-width="160" />
        <el-table-column prop="operator" label="操作员" width="110" />
        <el-table-column label="操作" width="90" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" class="wms-text-danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template slot="empty">暂无入库记录</template>
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
    <ModalForm :visible.sync="dialogVisible" title="入库登记" :model="form" :rules="rules" width="560px" @submit="handleSubmit">
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="form.orderNo" placeholder="请输入关联订单号" />
      </el-form-item>
      <el-form-item label="货物名称" prop="goodsName">
        <el-input v-model="form.goodsName" placeholder="请输入货物名称" />
      </el-form-item>
      <el-form-item label="入库仓库" prop="warehouse">
        <el-select v-model="form.warehouse" placeholder="请选择仓库" style="width:100%">
          <el-option v-for="w in warehouseSelectOptions" :key="w.id" :label="w.name" :value="w.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="入库类型" prop="inType">
        <el-select v-model="form.inType" placeholder="请选择入库类型" style="width:100%">
          <el-option v-for="t in STOCK_IN_TYPES" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item label="存储数量" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" controls-position="right" />
      </el-form-item>
      <el-form-item label="占用面积" prop="occupyArea">
        <el-input-number v-model="form.occupyArea" :min="1" controls-position="right" />
        <span class="form-tip">㎡</span>
      </el-form-item>
      <el-form-item label="客户" prop="customer">
        <el-input v-model="form.customer" placeholder="请输入客户名称" />
      </el-form-item>
      <el-form-item label="存储位置" prop="location">
        <el-select v-model="form.location" placeholder="请选择存储位置" style="width:100%">
          <el-option v-for="l in STORAGE_LOCATIONS" :key="l" :label="l" :value="l" />
        </el-select>
      </el-form-item>
    </ModalForm>
  </div>
</template>

<script>
/**
 * 入库管理列表页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import { getStockInList, stockInSubmit, deleteStockIn, STOCK_IN_TYPES, STORAGE_LOCATIONS } from '@/api/stock'
import { getAllWarehouses } from '@/api/warehouse'

export default {
  name: 'StockIn',
  components: { SearchFilterBar, ModalForm },
  data() {
    return {
      loading: false,
      query: { keyword: '', warehouse: '', inType: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0,
      STOCK_IN_TYPES,
      STORAGE_LOCATIONS,
      warehouseOptions: [],
      warehouseSelectOptions: [],
      dialogVisible: false,
      form: this.buildForm(),
      rules: {
        goodsName: [{ required: true, message: '请输入货物名称', trigger: 'blur' }],
        warehouse: [{ required: true, message: '请选择入库仓库', trigger: 'change' }],
        inType: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入存储数量', trigger: 'blur' }],
        occupyArea: [{ required: true, message: '请输入占用面积', trigger: 'blur' }],
        location: [{ required: true, message: '请选择存储位置', trigger: 'change' }]
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
    this.loadWarehouses()
    this.loadData()
  },
  methods: {
    buildForm() {
      return {
        orderNo: '',
        goodsName: '',
        warehouse: '',
        inType: '',
        quantity: 20,
        occupyArea: 10,
        customer: '',
        location: ''
      }
    },
    async loadWarehouses() {
      const res = await getAllWarehouses()
      const list = res || []
      this.warehouseSelectOptions = list
      this.warehouseOptions = list.map(w => w.name)
    },
    onSearch() {
      this.query.page = 1
      this.loadData()
    },
    resetQuery() {
      this.query = { keyword: '', warehouse: '', inType: '', page: 1, pageSize: 10 }
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getStockInList(this.query)
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
    openAdd() {
      this.form = this.buildForm()
      this.dialogVisible = true
    },
    handleSubmit(done) {
      // 业务逻辑待后端对接时完善：入库后需回写仓库已使用面积
      stockInSubmit(this.form)
        .then(() => {
          this.$message.success('入库登记成功')
          done()
          this.loadData()
        })
        .catch(() => done())
    },
    handleDelete(row) {
      this.$confirm('确认删除该入库记录？', '提示', { type: 'warning' })
        .then(() => deleteStockIn(row.id))
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

.form-tip {
  margin-left: 6px;
  font-size: $wms-fs-sm;
  color: $wms-text-3;
}
</style>
