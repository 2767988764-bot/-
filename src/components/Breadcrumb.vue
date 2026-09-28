<template>
  <div class="breadcrumb-bar">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in items" :key="index" :to="item.path">
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'Breadcrumb',
  computed: {
    items() {
      const matched = this.$route.matched.filter(r => r.meta && r.meta.title)
      const result = [{ path: '/dashboard', title: '首页' }]
      matched.forEach(r => {
        if (r.meta.title !== '首页仪表盘' && r.meta.title !== '首页') {
          result.push({ path: r.path, title: r.meta.title })
        } else if (r.meta.title === '首页仪表盘') {
          result.length = 1
          result.push({ path: '/dashboard', title: '首页仪表盘' })
        }
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.breadcrumb-bar {
  padding: 14px 0 16px;

  ::v-deep .el-breadcrumb {
    font-size: $wms-fs-sm;

    .el-breadcrumb__inner,
    .el-breadcrumb__separator {
      color: $wms-text-3;
      font-weight: 400;
    }

    .el-breadcrumb__item:last-child .el-breadcrumb__inner {
      color: $wms-text;
      font-weight: 500;
    }
  }
}
</style>