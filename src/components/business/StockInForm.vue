<template>
  <div class="stock-in-form">
    <el-form-item label="入库类型" prop="inType" :rules="rules.inType">
      <el-select v-model="form.inType" placeholder="请选择入库类型" class="form-item-full">
        <el-option v-for="item in inTypes" :key="item" :label="item" :value="item" />
      </el-select>
    </el-form-item>

    <el-form-item label="产品名称" prop="goodsName" :rules="rules.goodsName">
      <el-input v-model="form.goodsName" placeholder="请输入产品名称" maxlength="50" show-word-limit />
    </el-form-item>

    <el-form-item label="数量" prop="quantity" :rules="rules.quantity">
      <el-input-number v-model="form.quantity" :min="1" :step="1" controls-position="right" class="form-item-full" />
    </el-form-item>

    <el-form-item label="占用面积" prop="occupyArea" :rules="rules.occupyArea">
      <el-input-number
        v-model="form.occupyArea"
        :min="1"
        :step="5"
        controls-position="right"
        class="form-item-full"
      />
      <span class="form-suffix">㎡</span>
    </el-form-item>

    <el-form-item label="选择仓库" prop="warehouse" :rules="rules.warehouse">
      <el-select v-model="form.warehouse" placeholder="请选择仓库" class="form-item-full" filterable>
        <el-option
          v-for="item in warehouseOptions"
          :key="item.id"
          :label="item.name"
          :value="item.name"
        >
          <span class="opt-name">{{ item.name }}</span>
          <span class="opt-free">可用 {{ item.usableArea }}㎡</span>
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="存储位置" prop="location" :rules="rules.location">
      <el-select v-model="form.location" placeholder="请选择存储位置" class="form-item-full" filterable>
        <el-option v-for="item in storageLocations" :key="item" :label="item" :value="item" />
      </el-select>
    </el-form-item>

    <el-form-item label="客户" prop="customer" :rules="rules.customer">
      <el-input v-model="form.customer" placeholder="请输入客户名称" maxlength="50" />
    </el-form-item>

    <el-form-item label="订单号" prop="orderNo" :rules="rules.orderNo">
      <el-input v-model="form.orderNo" placeholder="请输入关联订单号" maxlength="32" />
    </el-form-item>
  </div>
</template>

<script>
import { getWarehouseOptions } from '@/api/warehouse'
import { STOCK_IN_TYPES, STORAGE_LOCATIONS, DEFAULT_OCCUPY_AREA } from '@/api/stock'

/**
 * StockInForm 入库登记弹窗表单
 * 作为 ModalForm 的 default slot 内容使用，父组件需将同一 form 对象透传给 ModalForm 的 model
 * 字段：入库类型 / 产品名称 / 数量 / 占用面积 / 选择仓库 / 存储位置 / 客户 / 订单号
 * label-width 100px（沿用 ModalForm 默认）
 */
export default {
  name: 'StockInForm',
  props: {
    /** 表单数据对象（与外层 ModalForm :model 同一引用） */
    form: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      inTypes: STOCK_IN_TYPES,
      storageLocations: STORAGE_LOCATIONS,
      warehouseOptions: [],
      rules: {
        inType: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
        goodsName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'change' }],
        occupyArea: [{ required: true, message: '请输入占用面积', trigger: 'change' }],
        warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
        location: [{ required: true, message: '请选择存储位置', trigger: 'change' }],
        customer: [{ required: false, message: '请输入客户名称', trigger: 'blur' }],
        orderNo: [{ required: false, message: '请输入关联订单号', trigger: 'blur' }]
      }
    }
  },
  created() {
    // 业务逻辑待后端对接时完善：仓库下拉数据由后端 options 接口提供
    this.loadWarehouseOptions()
    // 占用面积缺省值：单件默认 10 ㎡（设计稿默认值）
    if (this.form.occupyArea == null) {
      this.$set(this.form, 'occupyArea', DEFAULT_OCCUPY_AREA)
    }
    if (this.form.quantity == null) {
      this.$set(this.form, 'quantity', 1)
    }
  },
  methods: {
    loadWarehouseOptions() {
      getWarehouseOptions().then(list => {
        this.warehouseOptions = list || []
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-in-form {
  .form-item-full {
    width: 100%;
  }

  .form-suffix {
    margin-left: 8px;
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }

  ::v-deep .el-select-dropdown__item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .opt-name {
      color: $wms-text;
    }

    .opt-free {
      color: $wms-ok;
      font-size: $wms-fs-sm;
    }
  }
}
</style>
