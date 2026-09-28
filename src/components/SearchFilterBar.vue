<template>
  <div class="search-filter-bar">
    <div class="filter-left">
      <slot name="filters" />
    </div>
    <div class="filter-right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script>
/**
 * SearchFilterBar 搜索筛选栏
 * 左侧放搜索/筛选条件，右侧放操作按钮
 * 通过 slot 自由组合内容
 */
export default {
  name: 'SearchFilterBar'
}
</script>

<style lang="scss" scoped>
.search-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 20px;
  background: $wms-panel;
  border: 1px solid $wms-border;
  border-radius: $wms-radius-md;
  margin-bottom: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>