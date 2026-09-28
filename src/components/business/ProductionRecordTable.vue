<template>
  <el-table
    :data="list"
    border
    stripe
    size="small"
    class="production-record-table"
  >
    <el-table-column prop="orderNo" label="订单号" min-width="170" show-overflow-tooltip />
    <el-table-column prop="productName" label="产品名称" min-width="150" show-overflow-tooltip />
    <el-table-column prop="planQuantity" label="计划数量" width="100" align="right" />
    <el-table-column prop="actualQuantity" label="实际完成" width="100" align="right">
      <template slot-scope="{ row }">
        <span class="actual-qty">{{ row.actualQuantity }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="line" label="所属生产线" min-width="120" show-overflow-tooltip />
    <el-table-column label="产品状态" width="110" align="center">
      <template slot-scope="{ row }">
        <StatusTag :status="row.productStatus" />
      </template>
    </el-table-column>
    <el-table-column label="操作" width="220" align="center" fixed="right">
      <template slot-scope="{ row }">
        <el-button
          type="text"
          size="small"
          :disabled="row.productStatus === '已入库'"
          @click="$emit('in-stock', row)"
        >
          入库
        </el-button>
        <el-button
          type="text"
          size="small"
          :disabled="row.actualQuantity >= row.planQuantity"
          @click="$emit('complete', row)"
        >
          标记完成
        </el-button>
        <el-button
          type="text"
          size="small"
          class="wms-text-danger"
          @click="$emit('delete', row)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'

/**
 * ProductionRecordTable 生产档案表格
 * 用于生产档案管理页：列含 订单号 | 产品名称 | 计划数量 | 实际完成 | 所属生产线 | 产品状态 | 操作
 * 产品状态使用 StatusTag 展示，操作列通过事件外抛：in-stock / complete / delete
 */
export default {
  name: 'ProductionRecordTable',
  components: { StatusTag },
  props: {
    /** 生产档案列表数据 */
    list: { type: Array, default: () => [] }
  }
}
</script>

<style lang="scss" scoped>
.production-record-table {
  border-radius: $wms-radius-md;
  overflow: hidden;

  ::v-deep .el-table__header th {
    background: $wms-panel-2;
    color: $wms-text;
    font-weight: 600;
    font-size: $wms-fs-base;
  }

  ::v-deep .el-table__body td {
    font-size: $wms-fs-base;
    color: $wms-text;
  }

  .actual-qty {
    color: $wms-brand;
    font-weight: 500;
  }

  ::v-deep .el-button--text {
    padding: 0;
    font-size: $wms-fs-125;
    color: $wms-brand;

    &:hover {
      color: $wms-brand-hover;
    }

    &.is-disabled {
      color: $wms-text-3;
    }
  }

  ::v-deep .wms-text-danger {
    color: $wms-danger;

    &:hover {
      color: $wms-danger;
      opacity: 0.85;
    }
  }
}
</style>
