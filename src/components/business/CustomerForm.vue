<template>
  <div class="customer-form">
    <el-form-item label="客户名称" prop="name" :rules="rules.name" label-width="80px">
      <el-input v-model="form.name" placeholder="请输入客户名称" maxlength="50" show-word-limit />
    </el-form-item>

    <el-form-item label="联系人" prop="contact" :rules="rules.contact" label-width="80px">
      <el-input v-model="form.contact" placeholder="请输入联系人姓名" maxlength="20" />
    </el-form-item>

    <el-form-item label="联系电话" prop="phone" :rules="rules.phone" label-width="80px">
      <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
    </el-form-item>

    <el-form-item label="地址" prop="address" :rules="rules.address" label-width="80px">
      <el-input v-model="form.address" placeholder="请输入地址" maxlength="120" show-word-limit />
    </el-form-item>

    <el-form-item label="备注" prop="remark" :rules="rules.remark" label-width="80px">
      <el-input
        v-model="form.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注（可选）"
        maxlength="200"
        show-word-limit
      />
    </el-form-item>
  </div>
</template>

<script>
/**
 * CustomerForm 客户新增/编辑表单
 * 作为 ModalForm 的 default slot 内容使用，父组件需将同一 form 对象透传给 ModalForm 的 model
 * 字段：客户名称 / 联系人 / 联系电话 / 地址 / 备注
 * label-width 80px（在 el-form-item 上覆盖 ModalForm 默认的 100px）
 */
export default {
  name: 'CustomerForm',
  props: {
    /** 表单数据对象（与外层 ModalForm :model 同一引用） */
    form: { type: Object, default: () => ({}) }
  },
  data() {
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入联系电话'))
      }
      if (!/^1[3-9]\d{9}$/.test(value)) {
        return callback(new Error('请输入正确的手机号'))
      }
      callback()
    }
    return {
      rules: {
        name: [
          { required: true, message: '请输入客户名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        contact: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        remark: [{ required: false, message: '', trigger: 'blur' }]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-form {
  ::v-deep .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
