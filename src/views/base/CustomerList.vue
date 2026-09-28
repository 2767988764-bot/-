<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">客户列表</h1>
      <p class="wms-page-desc">管理客户档案，维护合作状态与黑名单</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索客户名称 / 联系人 / 电话" clearable style="width:240px" @keyup.enter.native="onSearch" />
        <el-select v-model="query.status" placeholder="状态" clearable style="width:140px">
          <el-option label="正常" value="正常" />
          <el-option label="黑名单" value="黑名单" />
        </el-select>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
      <template #actions>
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增客户</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="name" label="客户名称" min-width="160" />
        <el-table-column label="联系方式" min-width="160">
          <template slot-scope="{ row }">
            <div class="contact-cell">
              <span>{{ row.contact }}</span>
              <span class="contact-phone">{{ row.phone }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="orderCount" label="合作订单数" width="110" align="right" />
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center">
          <template slot-scope="{ row }">
            <div class="wms-row-actions">
              <el-button type="text" @click="openEdit(row)">编辑</el-button>
              <el-button v-if="row.status === '正常'" type="text" class="wms-text-danger" @click="handleBlacklist(row, '黑名单')">加入黑名单</el-button>
              <el-button v-else type="text" @click="handleBlacklist(row, '正常')">移出黑名单</el-button>
              <el-button type="text" class="wms-text-danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        <template slot="empty">暂无客户数据</template>
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
    <ModalForm :visible.sync="dialogVisible" :title="dialogTitle" :model="form" :rules="rules" width="520px" @submit="handleSubmit">
      <el-form-item label="客户名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入客户名称" />
      </el-form-item>
      <el-form-item label="联系人" prop="contact">
        <el-input v-model="form.contact" placeholder="请输入联系人姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入客户地址" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
      </el-form-item>
    </ModalForm>
  </div>
</template>

<script>
/**
 * 客户列表页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  getCustomerList,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  toggleBlacklist
} from '@/api/customer'

export default {
  name: 'CustomerList',
  components: { SearchFilterBar, ModalForm, StatusTag },
  data() {
    return {
      loading: false,
      query: { keyword: '', status: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0,
      dialogVisible: false,
      dialogTitle: '新增客户',
      form: this.buildForm(),
      rules: {
        name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
        contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
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
    buildForm() {
      return { id: null, name: '', contact: '', phone: '', address: '', remark: '' }
    },
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
        const res = await getCustomerList(this.query)
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
      this.dialogTitle = '新增客户'
      this.form = this.buildForm()
      this.dialogVisible = true
    },
    openEdit(row) {
      this.dialogTitle = '编辑客户'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleSubmit(done) {
      // 业务逻辑待后端对接时完善：编辑时保留原状态与订单数
      const save = this.form.id ? updateCustomer(this.form) : addCustomer(this.form)
      save
        .then(() => {
          this.$message.success('保存成功')
          done()
          this.loadData()
        })
        .catch(() => done())
    },
    handleBlacklist(row, status) {
      // 业务逻辑待后端对接时完善：黑名单变更需记录审计日志
      const action = status === '黑名单' ? '加入黑名单' : '移出黑名单'
      this.$confirm(`确认将「${row.name}」${action}？`, '提示', { type: 'warning' })
        .then(() => toggleBlacklist(row.id, status))
        .then(() => {
          this.$message.success(`${action}成功`)
          this.loadData()
        })
        .catch(() => {})
    },
    handleDelete(row) {
      this.$confirm('确认删除该客户？删除后不可恢复。', '提示', { type: 'warning' })
        .then(() => deleteCustomer(row.id))
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

.contact-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.4;

  .contact-phone {
    font-size: $wms-fs-sm;
    color: $wms-text-3;
    font-family: 'Geist Mono', Consolas, monospace;
  }
}
</style>
