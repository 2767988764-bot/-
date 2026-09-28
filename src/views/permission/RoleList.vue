<template>
  <div class="role-list-page">
    <div class="wms-page-head">
      <div>
        <h1 class="wms-page-title">角色管理</h1>
        <p class="wms-page-desc">管理系统角色及对应菜单 / 按钮权限分配</p>
      </div>
    </div>

    <SearchFilterBar>
      <template #filters>
        <el-input
          v-model="query.keyword"
          placeholder="搜索角色名称"
          clearable
          style="width: 220px"
          prefix-icon="el-icon-search"
          @keyup.enter.native="handleSearch"
          @clear="handleSearch"
        />
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
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增角色</el-button>
      </template>
    </SearchFilterBar>

    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="name" label="角色名称" min-width="140">
          <template #default="{ row }">
            <span class="role-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="角色描述" min-width="280" show-overflow-tooltip />
        <el-table-column prop="userCount" label="用户数" width="100" align="center">
          <template #default="{ row }">
            <span class="user-count">{{ row.userCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status === 1 ? '启用' : '停用'" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="text" icon="el-icon-edit" @click="openEdit(row)">编辑</el-button>
            <el-button type="text" icon="el-icon-share" @click="openAssignPermission(row)">分配权限</el-button>
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
      width="480px"
      @submit="handleSubmit"
      @closed="resetForm"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色职责描述"
            maxlength="120"
            show-word-limit
          />
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

    <!-- 分配权限弹窗 -->
    <el-dialog
      title="分配权限"
      :visible.sync="assignVisible"
      width="520px"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="assign-head">
        <div class="assign-role">
          <span class="label">角色：</span>
          <span class="role-name">{{ assignRole.name }}</span>
        </div>
        <el-input
          v-model="permissionFilter"
          placeholder="过滤权限名称"
          size="small"
          prefix-icon="el-icon-search"
          clearable
          style="width: 200px"
        />
      </div>
      <div class="assign-toolbar">
        <el-button type="text" @click="checkAll">全选</el-button>
        <el-button type="text" @click="checkNone">清空</el-button>
        <span class="assign-count">已选 {{ checkedCount }} 项</span>
      </div>
      <div v-loading="assignLoading" class="assign-tree-wrap">
        <el-tree
          ref="permTree"
          :data="permTree"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :default-expand-all="true"
          :filter-node-method="filterNode"
          :default-checked-keys="checkedKeys"
          @check="onTreeCheck"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignSubmitting" @click="handleAssignSubmit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import {
  getRoleList,
  addRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  saveRolePermissions
} from '@/api/role'
import { footerText } from '@/mock/helper'

export default {
  name: 'RoleList',
  components: { SearchFilterBar, ModalForm, StatusTag },
  data() {
    return {
      query: { keyword: '', status: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0,
      loading: false,
      // 新增/编辑
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      form: this.buildEmptyForm(),
      rules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      },
      // 分配权限
      assignVisible: false,
      assignLoading: false,
      assignSubmitting: false,
      assignRole: {},
      permTree: [],
      checkedKeys: [],
      treeProps: { label: 'label', children: 'children' },
      permissionFilter: ''
    }
  },
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '新增角色' : '编辑角色'
    },
    footerText() {
      return footerText(this.total, this.query.page, this.query.pageSize)
    },
    checkedCount() {
      return this.checkedKeys.length
    }
  },
  watch: {
    permissionFilter(val) {
      this.$refs.permTree && this.$refs.permTree.filter(val)
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    buildEmptyForm() {
      return { id: null, name: '', description: '', status: 1 }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getRoleList(this.query)
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
      this.query = { keyword: '', status: '', page: 1, pageSize: this.query.pageSize }
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
          await addRole({ ...this.form })
          this.$message.success('角色新增成功')
        } else {
          await updateRole({ ...this.form })
          this.$message.success('角色修改成功')
        }
        done()
        this.loadData()
      } catch (err) {
        this.$message.error(err && err.message ? err.message : '保存失败')
      }
    },
    handleDelete(row) {
      this.$confirm(`确认删除角色「${row.name}」吗？该角色下有 ${row.userCount} 名用户，删除后需重新分配。`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
        .then(async () => {
          await deleteRole(row.id)
          this.$message.success('删除成功')
          if (this.tableData.length === 1 && this.query.page > 1) this.query.page--
          this.loadData()
        })
        .catch(() => {})
    },
    async openAssignPermission(row) {
      this.assignRole = { ...row }
      this.assignVisible = true
      this.assignLoading = true
      this.permissionFilter = ''
      try {
        const res = await getRolePermissions(row.id)
        this.permTree = res.tree || []
        this.checkedKeys = res.checkedKeys || []
      } finally {
        this.assignLoading = false
        this.$nextTick(() => {
          this.$refs.permTree &&
            this.$refs.permTree.setCheckedKeys(this.checkedKeys.filter(k => this.nodeIsLeaf(k, this.permTree)))
          this.onTreeCheck()
        })
      }
    },
    nodeIsLeaf(id, tree) {
      for (const n of tree) {
        if (n.id === id) return !n.children || n.children.length === 0
        if (n.children && n.children.length) {
          const r = this.nodeIsLeaf(id, n.children)
          if (r) return true
        }
      }
      return false
    },
    onTreeCheck() {
      if (!this.$refs.permTree) return
      const keys = this.$refs.permTree.getCheckedKeys().concat(this.$refs.permTree.getHalfCheckedKeys())
      this.checkedKeys = keys
    },
    checkAll() {
      this.$refs.permTree && this.$refs.permTree.setCheckedNodes(this.flatten(this.permTree))
      this.onTreeCheck()
    },
    checkNone() {
      this.$refs.permTree && this.$refs.permTree.setCheckedKeys([])
      this.onTreeCheck()
    },
    flatten(tree, acc = []) {
      tree.forEach(n => {
        acc.push(n)
        if (n.children && n.children.length) this.flatten(n.children, acc)
      })
      return acc
    },
    filterNode(value, data) {
      if (!value) return true
      return (data.label || '').indexOf(value) !== -1
    },
    async handleAssignSubmit() {
      // 业务逻辑待后端对接时完善
      this.assignSubmitting = true
      try {
        const keys = this.$refs.permTree.getCheckedKeys().concat(this.$refs.permTree.getHalfCheckedKeys())
        await saveRolePermissions(this.assignRole.id, keys)
        this.$message.success('权限分配成功')
        this.assignVisible = false
      } catch (err) {
        this.$message.error(err && err.message ? err.message : '保存失败')
      } finally {
        this.assignSubmitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.role-list-page {
  padding: 24px $wms-page-padding 40px;
  max-width: $wms-content-width;
  margin: 0 auto;
}

.wms-page-head {
  margin-bottom: 20px;
}

.role-name {
  font-family: $wms-font-heading;
  font-size: $wms-fs-md;
  font-weight: 600;
  color: $wms-text;
}

.user-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  background: $wms-brand-soft;
  color: $wms-brand;
  border-radius: $wms-radius-sm;
  font-weight: 600;
  font-family: 'Geist Mono', monospace;
  font-size: $wms-fs-125;
}

.assign-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid $wms-border;
  margin-bottom: 12px;

  .assign-role {
    .label {
      font-size: $wms-fs-base;
      color: $wms-text-2;
    }
  }
}

.assign-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 0 4px 4px;

  .assign-count {
    margin-left: auto;
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }
}

.assign-tree-wrap {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid $wms-border;
  border-radius: $wms-radius;
  padding: 8px 12px;
  background: $wms-panel-3;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
