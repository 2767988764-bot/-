<template>
  <div class="login-page">
    <!-- ============ 左侧品牌面板（600px） ============ -->
    <div class="brand-panel">
      <!-- 插图 -->
      <div class="brand-illustration" :style="{ backgroundImage: `url(${illustration})` }"></div>
      <!-- 渐变遮罩：顶部 66% → 底部 94% -->
      <div class="brand-scrim"></div>
      <!-- 内容层 -->
      <div class="brand-content">
        <!-- 顶部品牌 -->
        <div class="brand-top">
          <span class="brand-logo">
            <span class="brand-logo-icon" v-html="iconSvg('boxes', 20)"></span>
          </span>
          <div class="brand-brandtext">
            <span class="brand-name">仓储物流管理系统</span>
            <span class="brand-sub">WMS · 中小型企业版</span>
          </div>
        </div>

        <!-- 中部主标题 -->
        <div class="brand-middle">
          <h1 class="brand-headline">让仓储、生产与发货，在一个系统里闭环</h1>
          <p class="brand-lead">从客户订单到生产入库、出库发货，统一管理每一件货物的流转轨迹与库存状态。</p>
          <ul class="brand-features">
            <li v-for="item in features" :key="item.key">
              <span class="feature-icon" v-html="iconSvg(item.key, 16)"></span>
              <span class="feature-text">{{ item.text }}</span>
            </li>
          </ul>
        </div>

        <!-- 底部版权 -->
        <div class="brand-copyright">© 2026 仓储物流管理系统 · 杭州云仓科技</div>
      </div>
    </div>

    <!-- ============ 右侧表单面板 ============ -->
    <div class="form-panel">
      <div class="card-wrap">
        <div class="login-card">
          <!-- 卡片头部 -->
          <div class="card-header">
            <span class="header-logo">
              <span class="header-logo-icon" v-html="iconSvg('boxes', 22)"></span>
            </span>
            <div class="header-text">
              <span class="header-title">仓储物流管理系统</span>
              <span class="header-sub">WMS Platform · 企业后台</span>
            </div>
          </div>

          <!-- 标题区 -->
          <div class="title-block">
            <h2 class="title-h">欢迎登录</h2>
            <p class="title-sub">请输入企业账号以继续访问管理后台</p>
          </div>

          <!-- 表单 -->
          <el-form
            ref="loginForm"
            :model="form"
            :rules="rules"
            @submit.native.prevent="handleLogin"
          >
            <div class="form-item">
              <label class="form-label">用户名</label>
              <el-input v-model="form.username" class="login-field" placeholder="请输入用户名 / 手机号" autocomplete="username">
                <template #prefix>
                  <span class="field-svg" v-html="iconSvg('user', 16)"></span>
                </template>
              </el-input>
            </div>
            <div class="form-item">
              <label class="form-label">密码</label>
              <el-input
                v-model="form.password"
                :type="passwordVisible ? 'text' : 'password'"
                class="login-field"
                placeholder="请输入登录密码"
                autocomplete="current-password"
                @keyup.enter.native="handleLogin"
              >
                <template #prefix>
                  <span class="field-svg" v-html="iconSvg('lock', 16)"></span>
                </template>
                <template #suffix>
                  <span class="field-svg field-eye" @click="passwordVisible = !passwordVisible" v-html="iconSvg('eye', 16)"></span>
                </template>
              </el-input>
            </div>

            <!-- 选项：记住状态 / 忘记密码 -->
            <div class="form-options">
              <div class="remember" @click="remember = !remember">
                <span class="remember-box" :class="{ 'is-checked': remember }">
                  <span v-if="remember" v-html="iconSvg('check', 11)"></span>
                </span>
                <span class="remember-text">记住登录状态</span>
              </div>
              <span class="forgot">忘记密码？</span>
            </div>

            <!-- 登录按钮 -->
            <el-button type="primary" class="login-submit" :loading="loading" @click="handleLogin">登 录</el-button>
          </el-form>

          <!-- 演示提示 -->
          <div class="demo-hint">
            <span class="demo-icon" v-html="iconSvg('info', 15)"></span>
            <span class="demo-text">演示账号：admin / 123456（系统管理员）</span>
          </div>
        </div>
      </div>

      <!-- 面板底部 -->
      <div class="form-footer">
        <p class="footer-a">遇到账号问题请联系系统管理员 · 400-000-0000</p>
        <p class="footer-b">支持 Chrome / Edge / Safari 最新版本</p>
      </div>
    </div>
  </div>
</template>

<script>
import illustration from '@/assets/generated.png'

/** 图标 path（Lucide，viewBox 0 0 24 24） */
const ICONS = {
  boxes:
    '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7.16 10 12 13l5-3-3.03-1.82a2 2 0 0 0-2.06 0L7.16 10Z"/><path d="m12 13 4.87 2.92A2 2 0 0 1 18 17.63v3.24a2 2 0 0 1-.97 1.71l-3 1.8a2 2 0 0 1-2.06 0L12 19"/><path d="M16.74 16.5 12 13.5"/>',
  user:
    '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  lock:
    '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  eye:
    '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  'clipboard-list':
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h.01M9 16h.01M13 12h2M13 16h2"/>',
  warehouse:
    '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12M6 14h12M6 10h12"/>',
  'shield-check':
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'
}

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false,
      remember: true,
      passwordVisible: false,
      illustration,
      features: [
        { key: 'clipboard-list', text: '订单 → 生产 → 入库 → 发货 全链路联动' },
        { key: 'warehouse', text: '仓库容量与使用率实时可视化' },
        { key: 'shield-check', text: '多角色权限管控与操作审计' }
      ]
    }
  },
  methods: {
    iconSvg(name, size) {
      const inner = ICONS[name] || ICONS.info
      return (
        '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>'
      )
    },
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          // 通过 vuex user/login action 登录：token 同步写入 vuex 与 localStorage
          const res = await this.$store.dispatch('user/login', {
            username: this.form.username,
            password: this.form.password
          })
          this.$message.success(`欢迎回来，${res.username}（${res.role}）`)
          const redirect = this.$route.query.redirect || '/dashboard'
          // catch 守卫动态挂载路由时产生的重定向 NavigationFailure，属正常流程
          this.$router.replace(redirect).catch(() => {})
        } catch (err) {
          this.$message.error(err && err.message ? err.message : '登录失败，请稍后重试')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  height: 100%;
  min-height: 100vh;
  background: $wms-bg;
}

/* ================= 左侧品牌面板 ================= */
.brand-panel {
  position: relative;
  width: 600px;
  flex-shrink: 0;
  background: $wms-nav-bg;
  overflow: hidden;
}

.brand-illustration {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.brand-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(12, 23, 18, 0.66), rgba(12, 23, 18, 0.94));
}

.brand-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px 48px;
}

.brand-top {
  display: flex;
  align-items: center;
  gap: 12px;

  .brand-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: $wms-brand;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .brand-logo-icon {
      display: flex;
      color: #ffffff;
    }
  }

  .brand-brandtext {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .brand-name {
      font-size: 17px;
      font-weight: 600;
      color: #ffffff;
    }

    .brand-sub {
      font-size: 11px;
      color: #a9b6ae;
    }
  }
}

.brand-middle {
  .brand-headline {
    font-size: 34px;
    line-height: 1.3;
    font-weight: 600;
    color: #ffffff;
  }

  .brand-lead {
    margin-top: 14px;
    font-size: 14px;
    line-height: 1.7;
    color: #bac5bd;
  }

  .brand-features {
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;

    li {
      display: flex;
      align-items: center;
      gap: 10px;

      .feature-icon {
        display: flex;
        color: $wms-nav-accent;
        flex-shrink: 0;
      }

      .feature-text {
        font-size: 13.5px;
        color: #d7ded9;
      }
    }
  }
}

.brand-copyright {
  font-size: 11.5px;
  color: #8e9a93;
}

/* ================= 右侧表单面板 ================= */
.form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px;
  background: $wms-bg;
  min-width: 0;
}

.card-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 420px;
  background: $wms-panel;
  border: 1px solid $wms-border;
  border-radius: $wms-radius-md;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 4px 12px rgba(0, 0, 0, 0.04);
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;

  .header-logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: $wms-brand-soft;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .header-logo-icon {
      display: flex;
      color: $wms-brand;
    }
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: $wms-text;
    }

    .header-sub {
      font-size: 11.5px;
      color: $wms-text-3;
    }
  }
}

.title-block {
  .title-h {
    font-size: 26px;
    font-weight: 600;
    color: $wms-text;
  }

  .title-sub {
    margin-top: 6px;
    font-size: 13px;
    color: $wms-text-3;
  }
}

.form-item {
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 0;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 12.5px;
    font-weight: 500;
    color: $wms-text-2;
  }
}

/* 输入框 44px，白底 1px 边框 圆角6 */
.login-field {
  ::v-deep .el-input__inner {
    height: 44px;
    line-height: 44px;
    border-radius: $wms-radius;
    border-color: $wms-border;
    background: $wms-panel;
    font-size: 13.5px;
    color: $wms-text;
    padding-left: 44px;
    padding-right: 40px;

    &::placeholder {
      color: $wms-text-3;
    }

    &:hover {
      border-color: $wms-border-strong;
    }

    &:focus {
      border-color: $wms-brand;
    }
  }

  ::v-deep .el-input__prefix {
    left: 14px;
    display: flex;
    align-items: center;
  }

  ::v-deep .el-input__suffix {
    right: 14px;
    display: flex;
    align-items: center;
  }

  .field-svg {
    display: flex;
    color: $wms-text-3;
  }

  .field-eye {
    cursor: pointer;

    &:hover {
      color: $wms-brand;
    }
  }
}

/* 选项行 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 2px;

  .remember {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .remember-box {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1px solid $wms-border-strong;
      background: $wms-panel;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;

      &.is-checked {
        background: $wms-brand;
        border-color: $wms-brand;
      }
    }

    .remember-text {
      font-size: 12.5px;
      color: $wms-text-2;
    }
  }

  .forgot {
    font-size: 12.5px;
    font-weight: 500;
    color: $wms-brand;
    cursor: pointer;

    &:hover {
      color: $wms-brand-hover;
    }
  }
}

/* 登录按钮 44px */
.login-submit {
  width: 100%;
  height: 44px;
  margin-top: 14px;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 2px;
  border-radius: $wms-radius;

  ::v-deep span {
    line-height: 44px;
  }
}

/* 演示提示 */
.demo-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  background: $wms-panel-3;
  border: 1px solid $wms-border;
  border-radius: $wms-radius;
  padding: 10px 14px;

  .demo-icon {
    display: flex;
    color: $wms-text-3;
    flex-shrink: 0;
  }

  .demo-text {
    font-size: 12px;
    color: $wms-text-2;
  }
}

/* 面板底部 */
.form-footer {
  text-align: center;

  .footer-a {
    font-size: 12px;
    color: $wms-text-3;
  }

  .footer-b {
    margin-top: 4px;
    font-size: 11px;
    color: $wms-text-3;
  }
}

/* 窄屏：隐藏左侧品牌面板 */
@media (max-width: 960px) {
  .brand-panel {
    display: none;
  }
}
</style>