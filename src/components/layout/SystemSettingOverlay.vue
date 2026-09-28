<template>
  <!-- 系统设置浮层：双 Tab（基础配置 + 数据字典） -->
  <div v-show="visible" class="settings-overlay" @click.self="handleClose">
    <transition name="overlay-fade">
      <div v-show="visible" class="overlay-panel" @click.stop>
        <!-- 顶部 Header -->
        <header class="overlay-header">
          <div class="header-titles">
            <h3 class="title">系统设置</h3>
            <span class="subtitle">管理全局配置与数据字典</span>
          </div>
          <button class="close-btn" @click="handleClose">
            <i class="el-icon-close"></i>
          </button>
        </header>

        <el-tabs v-model="activeTab" class="overlay-tabs">
          <!-- ========== Tab1：系统基础配置 ========== -->
          <el-tab-pane label="基础参数" name="config">
            <div class="config-content">
              <el-form
                ref="configFormRef"
                :model="configForm"
                :rules="configRules"
                label-position="top"
                class="config-form"
              >
                <!-- 系统名称 -->
                <el-form-item label="系统名称" prop="systemName">
                  <el-input
                    v-model="configForm.systemName"
                    placeholder="请输入系统名称"
                    maxlength="32"
                    show-word-limit
                  />
                </el-form-item>

                <!-- 系统 Logo 上传占位 -->
                <el-form-item label="系统 Logo" prop="logoUrl">
                  <div class="logo-uploader">
                    <div class="logo-preview" @click="handleLogoUpload">
                      <img
                        v-if="configForm.logoUrl"
                        :src="configForm.logoUrl"
                        class="logo-img"
                        alt="logo"
                      />
                      <div v-else class="logo-placeholder">
                        <i class="el-icon-plus"></i>
                        <span>点击上传 Logo</span>
                      </div>
                    </div>
                    <div class="logo-meta">
                      <span class="logo-tip">建议尺寸 200×60，支持 PNG / SVG，不超过 1MB</span>
                      <el-button
                        v-if="configForm.logoUrl"
                        type="text"
                        class="logo-clear"
                        @click="configForm.logoUrl = ''"
                      >
                        清除
                      </el-button>
                    </div>
                    <input
                      ref="logoInput"
                      type="file"
                      accept="image/*"
                      style="display: none"
                      @change="onLogoChange"
                    />
                  </div>
                </el-form-item>

                <!-- 编号规则 -->
                <div class="form-row">
                  <el-form-item label="订单编号生成规则" prop="orderNoRule">
                    <el-input
                      v-model="configForm.orderNoRule"
                      placeholder="如 DD{YYYY}{MM}{DD}{###}"
                    />
                  </el-form-item>
                  <el-form-item label="入库货号规则" prop="inboundNoRule">
                    <el-input
                      v-model="configForm.inboundNoRule"
                      placeholder="如 RK{YYYY}{MM}{DD}{###}"
                    />
                  </el-form-item>
                </div>

                <!-- 占用面积 -->
                <el-form-item label="入库默认占用面积（㎡）" prop="defaultInboundArea">
                  <el-input-number
                    v-model="configForm.defaultInboundArea"
                    :min="1"
                    :max="1000"
                    :step="1"
                    :precision="0"
                    controls-position="right"
                    class="area-input"
                  />
                  <span class="area-suffix">㎡</span>
                </el-form-item>

                <!-- 修改信息 -->
                <div class="modify-meta">
                  <span>最近修改：{{ configForm.updatedBy || '系统管理员' }}</span>
                  <span>{{ configForm.updatedAt || '—' }}</span>
                </div>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- ========== Tab2：数据字典管理 ========== -->
          <el-tab-pane label="数据字典" name="dict">
            <div class="dict-content">
              <div class="dict-layout">
                <!-- 左侧：字典分类主表 -->
                <div class="dict-pane main-pane">
                  <div class="pane-header">
                    <span class="pane-title">字典分类</span>
                    <el-button
                      type="primary"
                      size="mini"
                      class="btn-add"
                      @click="handleAddCategory"
                    >
                      <i class="el-icon-plus"></i> 新增
                    </el-button>
                  </div>
                  <el-table
                    :data="categoryList"
                    border
                    size="mini"
                    highlight-current-row
                    :row-class-name="row => ({ 'row-active': row.row.id === currentCategoryId })"
                    @current-change="onCategoryRowClick"
                    class="dict-table"
                  >
                    <el-table-column type="index" label="#" width="40" align="center" />
                    <el-table-column prop="code" label="分类编码" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="name" label="分类名称" min-width="110" show-overflow-tooltip />
                    <el-table-column label="状态" width="80" align="center">
                      <template slot-scope="{ row }">
                        <span class="status-tag" :class="row.status === 1 ? 'tag-ok' : 'tag-danger'">
                          {{ row.status === 1 ? '启用' : '停用' }}
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" align="center" fixed="right">
                      <template slot-scope="{ row }">
                        <el-button type="text" size="mini" @click.stop="handleEditCategory(row)">编辑</el-button>
                        <el-button
                          type="text"
                          size="mini"
                          class="op-toggle"
                          @click.stop="handleToggleCategoryStatus(row)"
                        >
                          {{ row.status === 1 ? '禁用' : '启用' }}
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <!-- 右侧：字典项子表 -->
                <div class="dict-pane sub-pane">
                  <div class="pane-header">
                    <span class="pane-title">
                      字典项
                      <em v-if="currentCategory" class="pane-sub">— {{ currentCategory.name }}</em>
                    </span>
                    <el-button
                      type="primary"
                      size="mini"
                      class="btn-add"
                      :disabled="!currentCategoryId"
                      @click="handleAddItem"
                    >
                      <i class="el-icon-plus"></i> 新增
                    </el-button>
                  </div>
                  <el-table
                    v-if="itemList.length"
                    :data="itemList"
                    border
                    size="mini"
                    class="dict-table"
                  >
                    <el-table-column type="index" label="#" width="40" align="center" />
                    <el-table-column prop="code" label="项编码" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="label" label="显示名称" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="value" label="存储值" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="sort" label="排序" width="60" align="center" />
                    <el-table-column label="状态" width="80" align="center">
                      <template slot-scope="{ row }">
                        <span class="status-tag" :class="row.status === 1 ? 'tag-ok' : 'tag-danger'">
                          {{ row.status === 1 ? '启用' : '停用' }}
                        </span>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" align="center" fixed="right">
                      <template slot-scope="{ row }">
                        <el-button type="text" size="mini" @click="handleEditItem(row)">编辑</el-button>
                        <el-button
                          type="text"
                          size="mini"
                          class="op-toggle"
                          @click="handleToggleItemStatus(row)"
                        >
                          {{ row.status === 1 ? '禁用' : '启用' }}
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div v-else class="empty-state">
                    <i class="el-icon-folder-opened"></i>
                    <span>{{ currentCategoryId ? '该分类下暂无字典项' : '请先在左侧选择字典分类' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 底部按钮（字典 Tab 用关闭，配置 Tab 用保存） -->
        <footer class="overlay-footer">
          <el-button class="btn-cancel" @click="handleClose">关闭</el-button>
          <el-button
            v-if="activeTab === 'config'"
            class="btn-save"
            type="primary"
            :loading="configSaving"
            @click="handleSaveConfig"
          >
            保存配置
          </el-button>
        </footer>

        <!-- 字典分类新增/编辑弹层 -->
        <el-dialog
          :title="categoryDialog.title"
          :visible.sync="categoryDialog.visible"
          :append-to-body="true"
          :close-on-click-modal="false"
          width="420px"
          custom-class="dict-dialog"
        >
          <el-form
            ref="categoryFormRef"
            :model="categoryForm"
            :rules="categoryRules"
            label-width="80px"
            size="small"
          >
            <el-form-item label="分类编码" prop="code">
              <el-input v-model="categoryForm.code" placeholder="唯一编码，如 order_status" />
            </el-form-item>
            <el-form-item label="分类名称" prop="name">
              <el-input v-model="categoryForm.name" placeholder="如 订单状态" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="categoryForm.description"
                type="textarea"
                :rows="2"
                placeholder="选填，分类用途说明"
              />
            </el-form-item>
          </el-form>
          <span slot="footer">
            <el-button @click="categoryDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitCategory">确定</el-button>
          </span>
        </el-dialog>

        <!-- 字典项新增/编辑弹层 -->
        <el-dialog
          :title="itemDialog.title"
          :visible.sync="itemDialog.visible"
          :append-to-body="true"
          :close-on-click-modal="false"
          width="420px"
          custom-class="dict-dialog"
        >
          <el-form
            ref="itemFormRef"
            :model="itemForm"
            :rules="itemRules"
            label-width="80px"
            size="small"
          >
            <el-form-item label="所属分类">
              <el-input :value="currentCategory ? currentCategory.name : ''" disabled />
            </el-form-item>
            <el-form-item label="项编码" prop="code">
              <el-input v-model="itemForm.code" placeholder="唯一编码" />
            </el-form-item>
            <el-form-item label="显示名称" prop="label">
              <el-input v-model="itemForm.label" placeholder="如 待付款" />
            </el-form-item>
            <el-form-item label="存储值" prop="value">
              <el-input v-model="itemForm.value" placeholder="如 PENDING" />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number
                v-model="itemForm.sort"
                :min="1"
                :max="999"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="itemForm.remark"
                type="textarea"
                :rows="2"
                placeholder="选填"
              />
            </el-form-item>
          </el-form>
          <span slot="footer">
            <el-button @click="itemDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitItem">确定</el-button>
          </span>
        </el-dialog>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  getSystemConfig,
  updateSystemConfig,
  getDictCategories,
  getDictItems,
  addDictCategory,
  updateDictCategory,
  toggleDictCategoryStatus,
  addDictItem,
  updateDictItem,
  toggleDictItemStatus
} from '@/api/settings'

export default {
  name: 'SystemSettingOverlay',
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      activeTab: 'config',
      configForm: {
        systemName: '',
        logoUrl: '',
        orderNoRule: '',
        inboundNoRule: '',
        defaultInboundArea: 10,
        updatedAt: '',
        updatedBy: ''
      },
      configRules: {
        systemName: [
          { required: true, message: '请输入系统名称', trigger: 'blur' },
          { max: 32, message: '不超过 32 个字符', trigger: 'blur' }
        ],
        orderNoRule: [
          { required: true, message: '请输入订单编号生成规则', trigger: 'blur' }
        ],
        inboundNoRule: [
          { required: true, message: '请输入入库货号生成规则', trigger: 'blur' }
        ],
        defaultInboundArea: [
          { required: true, message: '请填写入库默认占用面积', trigger: 'change' }
        ]
      },
      configSaving: false,
      categoryList: [],
      currentCategoryId: null,
      currentCategory: null,
      itemList: [],
      categoryDialog: { visible: false, title: '新增字典分类' },
      categoryForm: { id: null, code: '', name: '', description: '' },
      categoryRules: {
        code: [
          { required: true, message: '请输入分类编码', trigger: 'blur' },
          { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '只能包含字母、数字、下划线', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { max: 20, message: '不超过 20 个字符', trigger: 'blur' }
        ]
      },
      itemDialog: { visible: false, title: '新增字典项' },
      itemForm: {
        id: null,
        categoryId: null,
        code: '',
        label: '',
        value: '',
        sort: 1,
        remark: ''
      },
      itemRules: {
        code: [{ required: true, message: '请输入项编码', trigger: 'blur' }],
        label: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
        value: [{ required: true, message: '请输入存储值', trigger: 'blur' }]
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.activeTab = 'config'
        this.loadConfig()
        this.loadCategories()
      }
    }
  },
  methods: {
    /* ---------- 基础配置 ---------- */
    async loadConfig() {
      try {
        const data = await getSystemConfig()
        this.configForm = { ...data }
      } catch (e) {
        this.$message.error('加载系统配置失败')
      }
    },
    handleLogoUpload() {
      // 业务逻辑待与后端对接：上传到 OSS 后回填 URL
      this.$refs.logoInput.click()
    },
    onLogoChange(e) {
      const file = e.target.files[0]
      if (!file) return
      if (file.size > 1024 * 1024) {
        this.$message.warning('Logo 大小不能超过 1MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        this.configForm.logoUrl = reader.result
        this.$message.success('Logo 已选择，保存后生效')
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    },
    handleSaveConfig() {
      this.$refs.configFormRef.validate(async valid => {
        if (!valid) return
        this.configSaving = true
        try {
          await updateSystemConfig({ ...this.configForm })
          this.$message.success('系统配置保存成功')
        } catch (e) {
          this.$message.error('保存失败')
        } finally {
          this.configSaving = false
        }
      })
    },

    /* ---------- 字典分类 ---------- */
    async loadCategories() {
      try {
        const list = await getDictCategories()
        this.categoryList = list
        // 默认选中第一行
        if (list.length && !this.currentCategoryId) {
          this.onCategoryRowClick(list[0])
        }
      } catch (e) {
        this.$message.error('加载字典分类失败')
      }
    },
    onCategoryRowClick(row) {
      if (!row) return
      this.currentCategoryId = row.id
      this.currentCategory = row
      this.loadItems(row.id)
    },
    async loadItems(categoryId) {
      try {
        this.itemList = await getDictItems({ categoryId })
      } catch (e) {
        this.$message.error('加载字典项失败')
      }
    },
    handleAddCategory() {
      this.categoryForm = { id: null, code: '', name: '', description: '' }
      this.categoryDialog.title = '新增字典分类'
      this.categoryDialog.visible = true
      this.$nextTick(() => this.$refs.categoryFormRef && this.$refs.categoryFormRef.clearValidate())
    },
    handleEditCategory(row) {
      this.categoryForm = { ...row }
      this.categoryDialog.title = '编辑字典分类'
      this.categoryDialog.visible = true
      this.$nextTick(() => this.$refs.categoryFormRef && this.$refs.categoryFormRef.clearValidate())
    },
    async handleToggleCategoryStatus(row) {
      const target = row.status === 1 ? 0 : 1
      try {
        await toggleDictCategoryStatus(row.id, target)
        row.status = target
        this.$message.success(target === 1 ? '已启用' : '已停用')
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    handleSubmitCategory() {
      this.$refs.categoryFormRef.validate(async valid => {
        if (!valid) return
        try {
          if (this.categoryForm.id) {
            await updateDictCategory({ ...this.categoryForm })
            this.$message.success('分类已更新')
          } else {
            const added = await addDictCategory({ ...this.categoryForm, status: 1 })
            this.categoryList.push(added)
            this.$message.success('分类已新增')
          }
          this.categoryDialog.visible = false
        } catch (e) {
          this.$message.error('保存失败')
        }
      })
    },

    /* ---------- 字典项 ---------- */
    handleAddItem() {
      if (!this.currentCategoryId) {
        this.$message.warning('请先选择字典分类')
        return
      }
      this.itemForm = {
        id: null,
        categoryId: this.currentCategoryId,
        code: '',
        label: '',
        value: '',
        sort: (this.itemList.length || 0) + 1,
        remark: ''
      }
      this.itemDialog.title = '新增字典项'
      this.itemDialog.visible = true
      this.$nextTick(() => this.$refs.itemFormRef && this.$refs.itemFormRef.clearValidate())
    },
    handleEditItem(row) {
      this.itemForm = { ...row }
      this.itemDialog.title = '编辑字典项'
      this.itemDialog.visible = true
      this.$nextTick(() => this.$refs.itemFormRef && this.$refs.itemFormRef.clearValidate())
    },
    async handleToggleItemStatus(row) {
      const target = row.status === 1 ? 0 : 1
      try {
        await toggleDictItemStatus(row.id, target)
        row.status = target
        this.$message.success(target === 1 ? '已启用' : '已停用')
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    handleSubmitItem() {
      this.$refs.itemFormRef.validate(async valid => {
        if (!valid) return
        try {
          if (this.itemForm.id) {
            await updateDictItem({ ...this.itemForm })
            const idx = this.itemList.findIndex(i => i.id === this.itemForm.id)
            if (idx > -1) this.$set(this.itemList, idx, { ...this.itemForm })
            this.$message.success('字典项已更新')
          } else {
            const added = await addDictItem({ ...this.itemForm, status: 1 })
            this.itemList.push(added)
            this.$message.success('字典项已新增')
          }
          this.itemDialog.visible = false
        } catch (e) {
          this.$message.error('保存失败')
        }
      })
    },

    /* ---------- 关闭 ---------- */
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(34, 37, 43, 0.4);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.overlay-panel {
  width: 760px;
  max-height: 86vh;
  background: $wms-panel;
  border-radius: $wms-radius-md;
  box-shadow: $wms-shadow-lg;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ---------- Header ---------- */
.overlay-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 12px;
  border-bottom: 1px solid $wms-border;

  .header-titles {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .title {
      font-family: $wms-font-heading;
      font-size: $wms-fs-xl;
      font-weight: 600;
      color: $wms-text;
      margin: 0;
      line-height: 1.2;
    }

    .subtitle {
      font-size: $wms-fs-11;
      color: $wms-text-3;
    }
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: $wms-radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $wms-text-3;
    font-size: 16px;
    transition: all 0.15s ease;

    &:hover {
      background: $wms-panel-3;
      color: $wms-danger;
    }
  }
}

/* ---------- Tabs ---------- */
.overlay-tabs {
  padding: 0 24px;
  flex: 1;
  overflow-y: auto;

  ::v-deep .el-tabs__header {
    margin: 0 0 16px;
  }

  ::v-deep .el-tabs__nav-wrap::after {
    height: 1px;
    background: $wms-border;
  }

  ::v-deep .el-tabs__item {
    font-size: $wms-fs-md;
    color: $wms-text-2;
    height: 40px;
    line-height: 40px;

    &.is-active {
      color: $wms-brand;
      font-weight: 600;
    }
  }

  ::v-deep .el-tabs__active-bar {
    background: $wms-brand;
  }
}

/* ---------- Tab1：基础配置 ---------- */
.config-content {
  padding-bottom: 8px;
}

.config-form {
  ::v-deep .el-form-item__label {
    font-size: $wms-fs-sm;
    color: $wms-text-2;
    font-weight: 500;
    padding-bottom: 4px;
    line-height: 1.4;
  }

  ::v-deep .el-input__inner,
  ::v-deep .el-textarea__inner {
    border-radius: $wms-radius;
    border-color: $wms-border-strong;
    font-size: $wms-fs-base;

    &:hover {
      border-color: $wms-brand-hover;
    }

    &:focus {
      border-color: $wms-brand;
    }
  }
}

.form-row {
  display: flex;
  gap: 16px;

  ::v-deep .el-form-item {
    flex: 1;
  }
}

.logo-uploader {
  display: flex;
  align-items: center;
  gap: 16px;

  .logo-preview {
    width: 160px;
    height: 56px;
    border: 1px dashed $wms-border-strong;
    border-radius: $wms-radius;
    background: $wms-panel-3;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: border-color 0.15s ease;

    &:hover {
      border-color: $wms-brand;
    }

    .logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .logo-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: $wms-text-3;
      font-size: $wms-fs-11;

      i {
        font-size: 18px;
      }
    }
  }

  .logo-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .logo-tip {
      font-size: $wms-fs-11;
      color: $wms-text-3;
    }

    .logo-clear {
      padding: 0;
      color: $wms-danger;
      font-size: $wms-fs-11;
    }
  }
}

.area-input {
  ::v-deep .el-input__inner {
    width: 120px;
  }
}

.area-suffix {
  margin-left: 8px;
  color: $wms-text-3;
  font-size: $wms-fs-base;
}

.modify-meta {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  margin-top: 12px;
  background: $wms-panel-3;
  border-radius: $wms-radius;
  color: $wms-text-3;
  font-size: $wms-fs-11;
}

/* ---------- Tab2：数据字典 ---------- */
.dict-content {
  padding-bottom: 8px;
}

.dict-layout {
  display: flex;
  gap: 12px;
  height: 380px;
}

.dict-pane {
  display: flex;
  flex-direction: column;
  background: $wms-panel;
  border: 1px solid $wms-border;
  border-radius: $wms-radius;
  overflow: hidden;

  &.main-pane {
    width: 320px;
    flex-shrink: 0;
  }

  &.sub-pane {
    flex: 1;
    min-width: 0;
  }
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid $wms-border;
  background: $wms-panel-3;

  .pane-title {
    font-size: $wms-fs-125;
    font-weight: 600;
    color: $wms-text;

    .pane-sub {
      font-style: normal;
      color: $wms-text-2;
      font-weight: 400;
      margin-left: 4px;
    }
  }

  .btn-add {
    height: 24px;
    padding: 0 8px;
    background: $wms-brand;
    border: none;
    color: $wms-brand-ink;
    border-radius: $wms-radius-sm;
    font-size: $wms-fs-11;

    &:hover {
      background: $wms-brand-hover;
    }

    i {
      margin-right: 2px;
    }
  }
}

.dict-table {
  flex: 1;
  overflow-y: auto;

  ::v-deep .el-table {
    font-size: $wms-fs-125;

    th.el-table__cell {
      background: $wms-panel-2;
      color: $wms-text-2;
      font-weight: 600;
      padding: 6px 0;
    }

    td.el-table__cell {
      padding: 6px 0;
    }

    .el-table__row:hover > td.el-table__cell {
      background: $wms-brand-soft;
    }

    .row-active > td.el-table__cell {
      background: $wms-brand-soft !important;
    }
  }

  ::v-deep .el-button--text {
    color: $wms-brand;

    &.op-toggle {
      color: $wms-warn;

      &:hover {
        color: $wms-danger;
      }
    }
  }
}

.status-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 16px;

  &.tag-ok {
    background: $wms-ok-soft;
    color: $wms-ok;
  }

  &.tag-danger {
    background: $wms-danger-soft;
    color: $wms-danger;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $wms-text-3;
  font-size: $wms-fs-sm;

  i {
    font-size: 32px;
    color: $wms-text-3;
    opacity: 0.5;
  }
}

/* ---------- Footer ---------- */
.overlay-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid $wms-border;
  background: $wms-panel-3;

  .btn-cancel {
    height: 34px;
    padding: 0 16px;
    border: 1px solid $wms-border-strong;
    background: $wms-panel;
    color: $wms-text-2;
    border-radius: $wms-radius;
    font-size: $wms-fs-base;

    &:hover {
      border-color: $wms-brand-hover;
      color: $wms-brand;
    }
  }

  .btn-save {
    height: 34px;
    padding: 0 20px;
    background: $wms-brand;
    border: none;
    color: $wms-brand-ink;
    border-radius: $wms-radius;
    font-size: $wms-fs-base;
    font-weight: 500;

    &:hover {
      background: $wms-brand-hover;
    }
  }
}

/* ---------- 过渡动画 ---------- */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: all 0.18s ease;
}

.overlay-fade-enter,
.overlay-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}
</style>

<style lang="scss">
/* 字典新增/编辑弹层，全局样式（去掉 scoped，避免 el-dialog teleport 失效） */
.dict-dialog {
  border-radius: $wms-radius-md;
  overflow: hidden;

  .el-dialog__header {
    padding: 16px 20px 12px;
    border-bottom: 1px solid $wms-border;
    background: $wms-panel;

    .el-dialog__title {
      font-family: $wms-font-heading;
      font-size: $wms-fs-md;
      font-weight: 600;
      color: $wms-text;
    }

    .el-dialog__headerbtn {
      top: 16px;
      right: 16px;
    }
  }

  .el-dialog__body {
    padding: 20px;
    background: $wms-panel;
  }

  .el-dialog__footer {
    padding: 12px 20px 16px;
    border-top: 1px solid $wms-border;
    background: $wms-panel-3;

    .el-button--primary {
      background: $wms-brand;
      border-color: $wms-brand;

      &:hover {
        background: $wms-brand-hover;
      }
    }
  }

  .el-form-item__label {
    font-size: $wms-fs-sm;
    color: $wms-text-2;
    font-weight: 500;
  }

  .el-input__inner,
  .el-textarea__inner {
    border-radius: $wms-radius;
    border-color: $wms-border-strong;

    &:hover {
      border-color: $wms-brand-hover;
    }

    &:focus {
      border-color: $wms-brand;
    }
  }
}
</style>
