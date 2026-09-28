<template>
  <div class="not-found-page">
    <div class="nf-inner">
      <div class="nf-code">404</div>
      <h2 class="nf-title">页面不存在</h2>
      <p class="nf-desc">
        抱歉，您访问的页面可能已被删除、重命名，或暂时不可用。
      </p>
      <div class="nf-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
      <div class="nf-suggest">
        <span class="suggest-label">您还可以：</span>
        <router-link class="suggest-link" to="/dashboard">仪表盘</router-link>
        <em class="dot">·</em>
        <router-link class="suggest-link" to="/system/user">用户管理</router-link>
        <em class="dot">·</em>
        <router-link class="suggest-link" to="/order/list">订单管理</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goHome() {
      this.$router.replace('/dashboard')
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.replace('/dashboard')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: $wms-bg;
  padding: 40px 24px;
}

.nf-inner {
  text-align: center;
  max-width: 560px;
}

.nf-code {
  font-family: $wms-font-heading;
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  color: $wms-brand;
  letter-spacing: -4px;
  text-shadow: 0 6px 16px rgba(53, 96, 79, 0.18);
  margin-bottom: 18px;
}

.nf-title {
  font-family: $wms-font-heading;
  font-size: $wms-fs-2xl;
  font-weight: 600;
  color: $wms-text;
  margin-bottom: 8px;
}

.nf-desc {
  font-size: $wms-fs-md;
  color: $wms-text-2;
  line-height: 1.6;
  margin-bottom: 28px;
}

.nf-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 36px;

  .el-button {
    height: 36px;
    padding: 0 22px;
  }
}

.nf-suggest {
  font-size: $wms-fs-sm;
  color: $wms-text-3;

  .suggest-label {
    margin-right: 4px;
  }

  .suggest-link {
    color: $wms-brand;
    font-weight: 500;

    &:hover {
      color: $wms-brand-hover;
      text-decoration: underline;
    }
  }

  .dot {
    margin: 0 8px;
    font-style: normal;
    color: $wms-text-3;
  }
}
</style>
