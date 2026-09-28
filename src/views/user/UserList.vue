<template>
  <div class="user-list-page">
    <div class="wms-page-head">
      <div>
        <h1 class="wms-page-title">用户管理</h1>
        <p class="wms-page-desc">管理系统全部用户账号、角色与启用状态</p>
      </div>
    </div>

    <SearchFilterBar>
      <template #filters>
        <el-input
          v-model="query.keyword"
          placeholder="搜索姓名 / 用户名"
          clearable
          style="width: 220px"
          prefix-icon="el-icon-search"
          @keyup.enter.native="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="query.role"
          placeholder="全部角色"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
        </el-select>
        <el-select
          v-model="query.status"
          placeholder="全部状态"
          clearable
          style="width: 130px"
          @change="handleSearch"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </template>
      <template #actions>
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增用户</el-button>
      </template>
    </SearchFilterBar>

    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="name" label="姓名" min-width="100" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" min-width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" min-width="130">
          <template #default="{ row }">
            <span class="mono-text">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="{ row }">
            <span class="role-tag">{{ row.role }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status === 1 ? '启用' : '停用'" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="text" icon="el-icon-edit" @click="openEdit(row)">编辑</el-button>
            <el-button type="text" icon="el-icon-s-check" @click="openAssignRole(row)">分配角色</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <ModalForm
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :loading="submitting"
      width="520px"
      @submit="handleSubmit"
      @closed="resetForm"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" maxlength="20" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            maxlength="30"
            :disabled="dialogMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
    </ModalForm>

    <!-- 分配角色弹窗 -->
    <ModalForm
      :visible.sync="assignVisible"
      title="分配角色"
      :loading="assignSubmitting"
      width="420px"
      @submit="handleAssignSubmit"
    >
      <el-form ref="assignForm" :model="assignForm" :rules="assignRules" label-width="80px" size="small">
        <el-form-item label="用户">
          <el-input :value="assignForm.name + '（' + assignForm.username + '）'" disabled />
        </el-form-item>
        <el-form-item label="当前角色">
          <span class="role-tag">{{ assignForm.currentRole }}</span>
        </el-form-item>
        <el-form-item label="新角色" prop="role">
          <el-select v-model="assignForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
      </el-form>
    </ModalForm>
  </div>
</template>

<script>
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  getUserList,
  addUser,
  updateUser,
  deleteUser,
  assignRoles,
  getUserRoleOptions
} from '@/api/user'
import { footerText } from '@/mock/helper'

export default {
  name: 'UserList',
  components: { SearchFilterBar, ModalForm, StatusTag },
  data() {
    return {
      query: {
        keyword: '',
        role: '',
        status: '',
        page: 1,
        pageSize: 10
      },
      tableData: [],
      total: 0,
      loading: false,
      roleOptions: getUserRoleOptions(),
      // 新增/编辑
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      form: this.buildEmptyForm(),
      rules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: '请输入有效的 11 位手机号', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }]
      },
      // 分配角色
      assignVisible: false,
      assignSubmitting: false,
      assignForm: { id: null, name: '', username: '', currentRole: '', role: '' },
      assignRules: { role: [{ required: true, message: '请选择角色', trigger: 'change' }] }
    }
  },
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '新增用户' : '编辑用户'
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
      return { id: null, name: '', username: '', phone: '', email: '', role: '', status: 1 }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getUserList(this.query)
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
      this.query = { keyword: '', role: '', status: '', page: 1, pageSize: this.query.pageSize }
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
      this.form = { ...row }
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
          await addUser({ ...this.form })
          this.$message.success('用户新增成功')
        } else {
          await updateUser({ ...this.form })
          this.$message.success('用户修改成功')
        }
        done()
        this.loadData()
      } catch (err) {
        this.$message.error(err && err.message ? err.message : '保存失败')
      }
    },
    handleDelete(row) {
      this.$confirm(`确认删除用户「${row.name}」吗？删除后不可恢复。`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
        .then(async () => {
          await deleteUser(row.id)
          this.$message.success('删除成功')
          if (this.tableData.length === 1 && this.query.page > 1) {
            this.query.page--
          }
          this.loadData()
        })
        .catch(() => {})
    },
    openAssignRole(row) {
      this.assignForm = {
        id: row.id,
        name: row.name,
        username: row.username,
        currentRole: row.role,
        role: row.role
      }
      this.assignVisible = true
      this.$nextTick(() => this.$refs.assignForm && this.$refs.assignForm.clearValidate())
    },
    async handleAssignSubmit(done) {
      // 业务逻辑待后端对接时完善
      try {
        await assignRoles(this.assignForm.id, this.assignForm.role)
        this.$message.success('角色分配成功')
        done()
        this.loadData()
      } catch (err) {
        this.$message.error(err && err.message ? err.message : '分配失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list-page {
  padding: 24px $wms-page-padding 40px;
  max-width: $wms-content-width;
  margin: 0 auto;
}

.wms-page-head {
  margin-bottom: 20px;
}

.mono-text {
  font-family: 'Geist Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: $wms-fs-125;
  color: $wms-text;
}

.role-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  height: 22px;
  line-height: 18px;
  background: $wms-brand-soft;
  color: $wms-brand;
  border-radius: $wms-radius;
  font-size: $wms-fs-125;
  font-weight: 500;
}
</style>
