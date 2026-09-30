/**
 * Vue CLI 工程配置
 * 技术栈：Vue2 + Element-UI
 */
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 关闭 ESLint 保存时校验，保证工程可直接运行
  lintOnSave: false,
  productionSourceMap: false,
  publicPath: './',
  devServer: {
    port: 8080,
    open: true,
    // 开发环境代理：/api 转发到本地 FastAPI 后端（已启用）
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    },
    historyApiFallback: true
  },
  css: {
    loaderOptions: {
      sass: {
        // 全局注入设计变量（仅变量与 mixin，不产生重复 CSS）
        additionalData: '@import "@/styles/theme.scss";'
      }
    }
  }
})