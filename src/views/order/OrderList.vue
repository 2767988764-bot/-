<template>
  <div class="order-list-page">
    <div class="wms-page-head">
      <div>
        <h1 class="wms-page-title">订单管理</h1>
        <p class="wms-page-desc">订单全流程闭环：下单、支付、发货、签收</p>
      </div>
    </div>

    <SearchFilterBar>
      <template #filters>
        <el-input
          v-model="query.keyword"
          placeholder="订单编号 / 商品 / 客户"
          clearable
          style="width: 240px"
          prefix-icon="el-icon-search"
          @keyup.enter.native="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="query.payStatus"
          placeholder="支付状态"
          clearable
          style="width: 130px"
          @change="handleSearch"
        >
          <el-option label="已付款" value="已付款" />
          <el-option label="未付款" value="未付款" />
        </el-select>
        <el-select
          v-model="query.shipStatus"
          placeholder="发货状态"
          clearable
          style="width: 130px"
          @change="handleSearch"
        >
          <el-option label="已发货" value="已发货" />
          <el-option label="未发货" value="未发货" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </template>
      <template #actions>
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">新建订单</el-button>
      </template>
    </SearchFilterBar>

    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="orderNo" label="订单编号" min-width="180">
          <template #default="{ row }">
            <span class="order-no">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="customer" label="客户" min-width="160" show-overflow-tooltip />
        <el-table-column label="单价" width="110" align="right">
          <template #default="{ row }">
            <span class="mono-text">¥ {{ formatNum(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="90" align="right">
          <template #default="{ row }">
            <span class="mono-text">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="140" align="right">
          <template #default="{ row }">
            <span class="amount">¥ {{ formatAmount(row.price * row.quantity) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" icon="el-icon-edit" @click="openEdit(row)">编辑</el-button>
            <el-button
              type="text"
              icon="el-icon-s-promotion"
              :disabled="row.shipStatus === '已发货'"
              @click="openShip(row)"
            >发货</el-button>
            <el-button type="text wms-text-danger" icon="el-icon-delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="wms-table-footer">
        <span class="wms-footer-info">{{ footerText }}</span>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page.sync="query.page"
          :page-size.sync="query.pageSize"
          :page-sizes="[10, 20, 50]"
          @current-change="loadData"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <ModalForm
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :loading="submitting"
      width="520px"
      @submit="handleSubmit"
      @closed="resetForm"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="90px" size="small">
        <el-form-item label="商品名称" prop="productName">
          <el-select
            v-model="form.productName"
            placeholder="请选择或输入商品"
            filterable
            allow-create
            default-first-option
            style="width: 100%"
          >
            <el-option v-for="p in products" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户" prop="customer">
          <el-select v-model="form.customer" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="c in customers" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="单价（元）" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :step="100"
            controls-position="right"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            :min="1"
            :step="10"
            controls-position="right"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="支付状态" prop="payStatus">
          <el-radio-group v-model="form.payStatus">
            <el-radio-button label="未付款">未付款</el-radio-button>
            <el-radio-button label="已付款">已付款</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </ModalForm>

    <!-- 发货弹窗 -->
    <el-dialog
      title="确认发货"
      :visible.sync="shipVisible"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="shipForm" :model="shipForm" :rules="shipRules" label-width="90px" size="small">
        <el-form-item label="订单编号">
          <el-input :value="shipForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="商品">
          <el-input :value="shipForm.productName" disabled />
        </el-form-item>
        <el-form-item label="客户">
          <el-input :value="shipForm.customer" disabled />
        </el-form-item>
        <el-form-item label="物流公司" prop="logisticsCompany">
          <el-select v-model="shipForm.logisticsCompany" placeholder="请选择物流" filterable style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="韵达快递" value="韵达快递" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="trackingNo">
          <el-input v-model="shipForm.trackingNo" placeholder="请输入物流单号" maxlength="40" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" :loading="shipSubmitting" @click="handleShipSubmit">确认发货</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  getOrderList,
  addOrder,
  updateOrder,
  deleteOrder,
  shipOrder,
  PAY_STATUS,
  SHIP_STATUS,
  CUSTOMERS,
  PRODUCTS
} from '@/api/order'
import { footerText } from '@/mock/helper'

export default {
  name: 'OrderList',
  components: { SearchFilterBar, ModalForm, StatusTag },
  data() {
    return {
      query: {
        keyword: '',
        payStatus: '',
        shipStatus: '',
        page: 1,
        pageSize: 10
      },
      tableData: [],
      total: 0,
      loading: false,
      customers: CUSTOMERS,
      products: PRODUCTS,
      // 新增/编辑
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      form: this.buildEmptyForm(),
      rules: {
        productName: [{ required: true, message: '请选择商品', trigger: 'change' }],
        customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
        price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        payStatus: [{ required: true, message: '请选择支付状态', trigger: 'change' }]
      },
      // 发货
      shipVisible: false,
      shipSubmitting: false,
      shipForm: {
        id: null,
        orderNo: '',
        productName: '',
        customer: '',
        logisticsCompany: '',
        trackingNo: ''
      },
      shipRules: {
        logisticsCompany: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
        trackingNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '新建订单' : '编辑订单'
    },
    footerText() {
      return footerText(this.total, this.query.page, this.query.pageSize)
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    buildEmptyForm() {
      return {
        id: null,
        productName: '',
        customer: '',
        price: 1000,
        quantity: 100,
        payStatus: PAY_STATUS.UNPAID
      }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getOrderList(this.query)
        this.tableData = res.list || []
        this.total = res.total || 0
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.query.page = 1
      this.loadData()
    },
    resetQuery() {
      this.query = {
        keyword: '',
        payStatus: '',
        shipStatus: '',
        page: 1,
        pageSize: this.query.pageSize
      }
      this.loadData()
    },
    handleSizeChange(size) {
      this.query.pageSize = size
      this.query.page = 1
      this.loadData()
    },
    openAdd() {
      this.dialogMode = 'add'
      this.form = this.buildEmptyForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    openEdit(row) {
      this.dialogMode = 'edit'
      this.form = {
        id: row.id,
        productName: row.productName,
        customer: row.customer,
        price: row.price,
        quantity: row.quantity,
        payStatus: row.payStatus
      }
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    resetForm() {
      this.form = this.buildEmptyForm()
      this.$refs.form && this.$refs.form.clearValidate()
    },
    async handleSubmit(done) {
      // 业务逻辑待后端对接时完善
      try {
        if (this.dialogMode === 'add') {
          await addOrder({ ...this.form })
          this.$message.success('订单创建成功')
        } else {
          await updateOrder({ ...this.form })
          this.$message.success('订单修改成功')
        }
        done()
        this.loadData()
      } catch (err) {
        this.$message.error(err && err.message ? err.message : '保存失败')
      }
    },
    handleDelete(row) {
      this.$confirm(`确认删除订单「${row.orderNo}」吗？删除后不可恢复。`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
        .then(async () => {
          await deleteOrder(row.id)
          this.$message.success('删除成功')
          if (this.tableData.length === 1 && this.query.page > 1) this.query.page--
          this.loadData()
        })
        .catch(() => {})
    },
    openShip(row) {
      this.shipForm = {
        id: row.id,
        orderNo: row.orderNo,
        productName: row.productName,
        customer: row.customer,
        logisticsCompany: '',
        trackingNo: ''
      }
      this.shipVisible = true
      this.$nextTick(() => this.$refs.shipForm && this.$refs.shipForm.clearValidate())
    },
    async handleShipSubmit() {
      this.$refs.shipForm.validate(async valid => {
        if (!valid) return
        this.shipSubmitting = true
        try {
          // 业务逻辑待后端对接时完善：实际应调用发货接口
          await shipOrder(this.shipForm.id, {
            logisticsCompany: this.shipForm.logisticsCompany,
            trackingNo: this.shipForm.trackingNo
          })
          this.$message.success('发货成功')
          this.shipVisible = false
          this.loadData()
        } catch (err) {
          this.$message.error(err && err.message ? err.message : '发货失败')
        } finally {
          this.shipSubmitting = false
        }
      })
    },
    formatNum(n) {
      if (n == null) return '0.00'
      return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatAmount(n) {
      if (n == null) return '0.00'
      return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list-page {
  padding: 24px $wms-page-padding 40px;
  max-width: $wms-content-width;
  margin: 0 auto;
}

.wms-page-head {
  margin-bottom: 20px;
}

.order-no {
  font-family: 'Geist Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: $wms-fs-125;
  color: $wms-brand;
  font-weight: 500;
}

.mono-text {
  font-family: 'Geist Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: $wms-fs-125;
  color: $wms-text-2;
}

.amount {
  font-family: 'Geist Mono', monospace;
  font-size: $wms-fs-base;
  color: $wms-text;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
