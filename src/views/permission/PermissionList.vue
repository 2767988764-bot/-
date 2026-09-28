<template>
  <div class="permission-list-page">
    <div class="wms-page-head">
      <div>
        <h1 class="wms-page-title">权限管理</h1>
        <p class="wms-page-desc">管理系统菜单 / 按钮资源，控制前端路由与按钮显示</p>
      </div>
    </div>

    <SearchFilterBar>
      <template #filters>
        <el-input
          v-model="query.keyword"
          placeholder="搜索权限名称"
          clearable
          style="width: 220px"
          prefix-icon="el-icon-search"
          @keyup.enter.native="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="query.level"
          placeholder="全部级别"
          clearable
          style="width: 140px"
          @change="handleSearch"
        >
          <el-option v-for="lv in levels" :key="lv" :label="lv" :value="lv" />
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
        <el-button type="primary" icon="el-icon-plus" @click="openAdd">新增权限</el-button>
      </template>
    </SearchFilterBar>

    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="name" label="权限名称" min-width="160">
          <template #default="{ row }">
            <span class="perm-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="180">
          <template #default="{ row }">
            <span class="mono-text">{{ row.path }}</span>
          </template>
        </el-table-column>
        <el-table-column label="权限级别" width="120" align="center">
          <template #default="{ row }">
            <span class="level-tag" :class="levelClass(row.level)">{{ row.level }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center">
          <template #default="{ row }">
            <span class="sort-num">{{ row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              :value="row.status === 1"
              active-color="#35604F"
              @change="val => handleToggleStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="id" label="权限ID" width="100" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="text" icon="el-icon-edit" @click="openEdit(row)">编辑</el-button>
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
      <el-form ref="form" :model="form" :rules="rules" label-width="90px" size="small">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="如 /system/user" maxlength="60">
            <template slot="prepend">/</template>
          </el-input>
        </el-form-item>
        <el-form-item label="权限级别" prop="level">
          <el-select v-model="form.level" placeholder="请选择级别" style="width: 100%">
            <el-option v-for="lv in levels" :key="lv" :label="lv" :value="lv" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级权限">
          <el-select
            v-model="form.parentId"
            placeholder="顶级权限（不选）"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="p in parentOptions"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="0"
            :max="9999"
            controls-position="right"
            style="width: 160px"
          />
          <span class="form-tip">数值越小越靠前</span>
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
  </div>
</template>

<script>
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import ModalForm from '@/components/ModalForm.vue'
import {
  getPermissionList,
  addPermission,
  updatePermission,
  deletePermission,
  togglePermissionStatus,
  getPermissionLevels
} from '@/api/permission'
import { footerText } from '@/mock/helper'

export default {
  name: 'PermissionList',
  components: { SearchFilterBar, ModalForm },
  data() {
    return {
      query: { keyword: '', level: '', status: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0,
      loading: false,
      levels: getPermissionLevels(),
      // 新增/编辑
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      form: this.buildEmptyForm(),
      rules: {
        name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
        path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
        level: [{ required: true, message: '请选择权限级别', trigger: 'change' }],
        sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '新增权限' : '编辑权限'
    },
    footerText() {
      return footerText(this.total, this.query.page, this.query.pageSize)
    },
    parentOptions() {
      // 上级权限仅展示目录与菜单
      return []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    buildEmptyForm() {
      return { id: null, name: '', path: '', level: '菜单', sort: 1, status: 1, parentId: 0 }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getPermissionList(this.query)
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
      this.query = { keyword: '', level: '', status: '', page: 1, pageSize: this.query.pageSize }
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
      this.form = { ...row, path: (row.path || '').replace(/^\//, '') }
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
        const payload = { ...this.form, path: '/' + (this.form.path || '').replace(/^\//, '') }
        if (this.dialogMode === 'add') {
          await addPermission(payload)
          this.$message.success('权限新增成功')
        } else {
          await updatePermission(payload)
          this.$message.success('权限修改成功')
        }
        done()
        this.loadData()
      } catch (err) {
        this.$message.error(err && err.message ? err.message : '保存失败')
      }
    },
    async handleToggleStatus(row, val) {
      // 业务逻辑待后端对接时完善
      const target = val ? 1 : 0
      try {
        await togglePermissionStatus(row.id, target)
        row.status = target
        this.$message.success(target === 1 ? '已启用' : '已停用')
      } catch (err) {
        this.$message.error(err && err.message ? err.message : '操作失败')
      }
    },
    handleDelete(row) {
      this.$confirm(`确认删除权限「${row.name}」吗？删除后相关角色将不再拥有该权限。`, '删除确认', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
        .then(async () => {
          await deletePermission(row.id)
          this.$message.success('删除成功')
          if (this.tableData.length === 1 && this.query.page > 1) this.query.page--
          this.loadData()
        })
        .catch(() => {})
    },
    levelClass(level) {
      if (level === '目录') return 'level-dir'
      if (level === '菜单') return 'level-menu'
      return 'level-btn'
    }
  }
}
</script>

<style lang="scss" scoped>
.permission-list-page {
  padding: 24px $wms-page-padding 40px;
  max-width: $wms-content-width;
  margin: 0 auto;
}

.wms-page-head {
  margin-bottom: 20px;
}

.perm-name {
  font-family: $wms-font-heading;
  font-size: $wms-fs-md;
  font-weight: 600;
  color: $wms-text;
}

.mono-text {
  font-family: 'Geist Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: $wms-fs-125;
  color: $wms-text-2;
}

.sort-num {
  font-family: 'Geist Mono', monospace;
  font-size: $wms-fs-base;
  color: $wms-text;
  font-weight: 500;
}

.level-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  height: 22px;
  line-height: 18px;
  border-radius: $wms-radius;
  font-size: $wms-fs-125;
  font-weight: 500;

  &.level-dir {
    background: $wms-info-soft;
    color: $wms-info;
  }

  &.level-menu {
    background: $wms-brand-soft;
    color: $wms-brand;
  }

  &.level-btn {
    background: $wms-warn-soft;
    color: $wms-warn;
  }
}

.form-tip {
  margin-left: 8px;
  font-size: $wms-fs-sm;
  color: $wms-text-3;
}
</style>
