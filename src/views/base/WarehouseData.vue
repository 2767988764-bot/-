<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">仓库资料</h1>
      <p class="wms-page-desc">维护仓库基础信息、容量与启用状态</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索编号 / 名称 / 地址" clearable style="width:220px" @keyup.enter.native="onSearch" />
        <el-select v-model="query.type" placeholder="类型" clearable style="width:140px">
          <el-option v-for="t in WAREHOUSE_TYPES" :key="t" :label="t" :value="t" />
        </el-select>
        <el-select v-model="query.status" placeholder="状态" clearable style="width:120px">
          <el-option label="启用" value="1" />
          <el-option label="停用" value="0" />
        </el-select>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
      <template #actions>
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增仓库</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="code" label="仓库编号" width="100" />
        <el-table-column prop="name" label="仓库名称" min-width="160" />
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column prop="totalArea" label="总面积(㎡)" width="110" align="right" />
        <el-table-column prop="usedArea" label="已使用(㎡)" width="110" align="right" />
        <el-table-column prop="usableArea" label="可用(㎡)" width="100" align="right" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="manager" label="管理员" width="100" />
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="{ row }">
            <el-switch
              :value="row.status === 1"
              active-color="#35604F"
              @change="handleToggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template slot-scope="{ row }">
            <div class="wms-row-actions">
              <el-button type="text" @click="openEdit(row)">编辑</el-button>
              <el-button type="text" class="wms-text-danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        <template slot="empty">暂无仓库数据</template>
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
      <el-form-item label="仓库编号" prop="code">
        <el-input v-model="form.code" placeholder="请输入仓库编号" />
      </el-form-item>
      <el-form-item label="仓库名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入仓库名称" />
      </el-form-item>
      <el-form-item label="仓库类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择仓库类型" style="width:100%">
          <el-option v-for="t in WAREHOUSE_TYPES" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item label="总面积(㎡)" prop="totalArea">
        <el-input-number v-model="form.totalArea" :min="1" controls-position="right" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入仓库地址" />
      </el-form-item>
      <el-form-item label="管理员" prop="manager">
        <el-input v-model="form.manager" placeholder="请输入管理员姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
    </ModalForm>
  </div>
</template>

<script>
/**
 * 仓库资料列表页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import {
  getWarehouseList,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse,
  toggleWarehouseStatus,
  WAREHOUSE_TYPES
} from '@/api/warehouse'

export default {
  name: 'WarehouseData',
  components: { SearchFilterBar, ModalForm },
  data() {
    return {
      loading: false,
      query: { keyword: '', type: '', status: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0,
      WAREHOUSE_TYPES,
      dialogVisible: false,
      dialogTitle: '新增仓库',
      form: this.buildForm(),
      rules: {
        code: [{ required: true, message: '请输入仓库编号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择仓库类型', trigger: 'change' }],
        totalArea: [{ required: true, message: '请输入总面积', trigger: 'blur' }],
        address: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
        manager: [{ required: true, message: '请输入管理员', trigger: 'blur' }]
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
      return {
        id: null,
        code: '',
        name: '',
        type: '',
        totalArea: 500,
        address: '',
        manager: '',
        phone: '',
        status: 1
      }
    },
    onSearch() {
      this.query.page = 1
      this.loadData()
    },
    resetQuery() {
      this.query = { keyword: '', type: '', status: '', page: 1, pageSize: 10 }
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getWarehouseList(this.query)
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
      this.dialogTitle = '新增仓库'
      this.form = this.buildForm()
      this.dialogVisible = true
    },
    openEdit(row) {
      this.dialogTitle = '编辑仓库'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleSubmit(done) {
      // 业务逻辑待后端对接时完善：新增仓库默认 usedArea 为 0
      const save = this.form.id ? updateWarehouse(this.form) : addWarehouse(this.form)
      save
        .then(() => {
          this.$message.success('保存成功')
          done()
          this.loadData()
        })
        .catch(() => done())
    },
    handleToggleStatus(row) {
      // 业务逻辑待后端对接时完善：停用仓库后相关入库需拦截
      const next = row.status === 1 ? 0 : 1
      toggleWarehouseStatus(row.id, next).then(() => {
        this.$message.success(next === 1 ? '已启用' : '已停用')
        this.loadData()
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该仓库？删除后不可恢复。', '提示', { type: 'warning' })
        .then(() => deleteWarehouse(row.id))
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
