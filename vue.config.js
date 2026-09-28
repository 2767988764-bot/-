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
    // 【后端接口就绪后】放开下面的代理配置，并把 src/utils/request.js 的 baseURL 改为 '/api'
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:9090',
    //     changeOrigin: true,
    //     pathRewrite: { '^/api': '' }
    //   }
    // }
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