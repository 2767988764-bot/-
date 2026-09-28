<template>
  <div class="production-line-card">
    <div class="card-header">
      <div class="header-title">
        <h3 class="line-name">{{ line.name }}</h3>
        <span class="line-code">ID: {{ line.id }}</span>
      </div>
      <StatusTag :status="line.status" />
    </div>

    <div class="card-ring">
      <ProductionProgressRing :data="ringData" />
    </div>

    <div class="card-info">
      <div class="info-row">
        <span class="info-label">关联订单</span>
        <span class="info-value">{{ line.orderNo }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">生产货物</span>
        <span class="info-value">{{ line.goodsName }}</span>
      </div>
      <div class="info-row info-quantity">
        <div class="quantity-item">
          <span class="info-label">计划数量</span>
          <span class="info-value">{{ line.planQuantity }}</span>
        </div>
        <div class="quantity-item">
          <span class="info-label">完成数量</span>
          <span class="info-value quantity-done">{{ line.completedQuantity }}</span>
        </div>
      </div>
      <div class="info-row info-desc">
        <span class="info-label">描述</span>
        <span class="info-value-desc">{{ line.description }}</span>
      </div>
    </div>

    <div class="card-actions">
      <el-button type="text" size="small" @click="$emit('edit', line)">编辑</el-button>
      <el-divider direction="vertical" />
      <el-button
        type="text"
        size="small"
        :disabled="line.status !== '待开始'"
        @click="$emit('start', line)"
      >
        开始
      </el-button>
      <el-divider direction="vertical" />
      <el-button
        type="text"
        size="small"
        :disabled="line.status === '已完成'"
        @click="$emit('complete', line)"
      >
        完成
      </el-button>
    </div>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'
import ProductionProgressRing from './ProductionProgressRing.vue'

/**
 * ProductionLineCard 生产线信息卡片
 * 用于生产线管理页：展示产线名称、状态、进度环、关键指标与操作按钮
 * props.line: { id, name, orderNo, goodsName, planQuantity, completedQuantity, progress, description, status, enable }
 */
export default {
  name: 'ProductionLineCard',
  components: { StatusTag, ProductionProgressRing },
  props: {
    /** 生产线对象 */
    line: { type: Object, default: () => ({}) }
  },
  computed: {
    ringData() {
      // 业务逻辑待后端对接时完善：progress 字段后端实时回写
      return {
        name: this.line.name,
        orderNo: this.line.orderNo,
        completed: this.line.completedQuantity,
        total: this.line.planQuantity,
        progress: this.line.progress
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.production-line-card {
  @include wms-card;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .header-title {
    display: flex;
    align-items: baseline;
    gap: 8px;
    @include wms-ellipsis;

    .line-name {
      font-family: $wms-font-heading;
      font-size: $wms-fs-lg;
      font-weight: 600;
      color: $wms-text;
      line-height: 1.3;
    }

    .line-code {
      font-size: $wms-fs-sm;
      color: $wms-text-3;
      flex-shrink: 0;
    }
  }
}

.card-ring {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid $wms-border;
  border-bottom: 1px solid $wms-border;

  .info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: $wms-fs-base;

    .info-label {
      flex: 0 0 64px;
      color: $wms-text-3;
    }

    .info-value {
      color: $wms-text;
      font-weight: 500;
      @include wms-ellipsis;
    }

    .info-value-desc {
      color: $wms-text-2;
      line-height: 1.5;
      font-weight: 400;
      @include wms-ellipsis;
    }
  }

  .info-quantity {
    display: flex;
    gap: 24px;

    .quantity-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quantity-done {
      color: $wms-brand;
    }
  }

  .info-desc {
    align-items: flex-start;
  }
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  ::v-deep .el-button--text {
    color: $wms-brand;
    font-size: $wms-fs-base;

    &:hover {
      color: $wms-brand-hover;
    }

    &.is-disabled {
      color: $wms-text-3;
    }
  }

  ::v-deep .el-divider--vertical {
    margin: 0 4px;
    height: 12px;
  }
}
</style>
