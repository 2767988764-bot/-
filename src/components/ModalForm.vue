<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :width="width"
    :close-on-click-modal="false"
    append-to-body
    @closed="onClosed"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
      <slot />
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * ModalForm 弹窗表单组件
 * 用于新增、编辑、分配权限、入库登记等场景
 * 通过 default slot 自定义表单字段，通过 props 控制标题/宽度/加载状态
 */
export default {
  name: 'ModalForm',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '弹窗' },
    width: { type: String, default: '480px' },
    loading: { type: Boolean, default: false }
  },
  data() {
    return { submitting: false }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    form() { return this.$attrs.model || {} },
    rules() { return this.$attrs.rules || {} }
  },
  methods: {
    handleCancel() {
      this.dialogVisible = false
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.submitting = true
        this.$emit('submit', () => {
          this.submitting = false
          this.dialogVisible = false
        })
      })
    },
    onClosed() {
      this.$emit('closed')
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    /** 供父组件调用：清除校验 */
    clearValidate() {
      this.$refs.form && this.$refs.form.clearValidate()
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>