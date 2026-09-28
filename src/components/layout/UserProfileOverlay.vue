<template>
  <!-- 个人中心浮层：双 Tab（个人资料 + 修改密码） -->
  <div v-show="visible" class="profile-overlay" @click.self="handleClose">
    <transition name="overlay-fade">
      <div v-show="visible" class="overlay-panel" @click.stop>
        <!-- 顶部 Header（标题 + 关闭按钮） -->
        <header class="overlay-header">
          <div class="header-titles">
            <h3 class="title">个人中心</h3>
            <span class="subtitle">查看并管理你的账户信息</span>
          </div>
          <button class="close-btn" @click="handleClose">
            <i class="el-icon-close"></i>
          </button>
        </header>

        <el-tabs v-model="activeTab" class="overlay-tabs">
          <!-- ========== Tab 1：个人资料 ========== -->
          <el-tab-pane label="个人资料" name="profile">
            <div class="profile-content">
              <!-- 头像区域 -->
              <div class="avatar-block">
                <div class="avatar-wrap">
                  <span class="avatar">{{ avatarText }}</span>
                  <button class="avatar-upload" @click="handleAvatarUpload">
                    <i class="el-icon-camera"></i>
                  </button>
                  <input
                    ref="avatarInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="onAvatarChange"
                  />
                </div>
                <div class="avatar-info">
                  <span class="avatar-name">{{ profileForm.name }}</span>
                  <span class="avatar-role">{{ profileForm.role }}</span>
                </div>
              </div>

              <!-- 只读字段 -->
              <div class="form-row">
                <div class="form-item">
                  <label class="form-label">用户名</label>
                  <div class="readonly-field">{{ profileForm.username }}</div>
                </div>
                <div class="form-item">
                  <label class="form-label">角色</label>
                  <div class="readonly-field">{{ profileForm.role }}</div>
                </div>
              </div>

              <!-- 可编辑表单 -->
              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-position="top"
                class="profile-form"
              >
                <div class="form-row">
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="profileForm.name" placeholder="请输入姓名" />
                  </el-form-item>
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                  </el-form-item>
                </div>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- ========== Tab 2：修改密码 ========== -->
          <el-tab-pane label="修改密码" name="password">
            <div class="password-content">
              <!-- 安全提示 -->
              <div class="security-tip">
                <i class="el-icon-warning-outline"></i>
                <span>为了账户安全，请定期修改密码。密码需 6-20 位，包含字母与数字。</span>
              </div>

              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-position="top"
                class="password-form"
              >
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    show-password
                    placeholder="请输入当前密码"
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    show-password
                    placeholder="请输入新密码"
                  />
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    show-password
                    placeholder="请再次输入新密码"
                  />
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 底部按钮 -->
        <footer class="overlay-footer">
          <el-button class="btn-cancel" @click="handleClose">取消</el-button>
          <el-button
            v-if="activeTab === 'profile'"
            class="btn-save"
            type="primary"
            :loading="profileSaving"
            @click="handleSaveProfile"
          >
            保存修改
          </el-button>
          <el-button
            v-else
            class="btn-save"
            type="primary"
            :loading="passwordSaving"
            @click="handleChangePassword"
          >
            确认修改
          </el-button>
        </footer>
      </div>
    </transition>
  </div>
</template>

<script>
import { getProfile, updateProfile, changePassword } from '@/api/profile'

export default {
  name: 'UserProfileOverlay',
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    // 确认密码校验
    const validateConfirm = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入新密码'))
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    // 新密码校验：6-20 位，必须包含字母与数字
    const validateNewPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (value.length < 6 || value.length > 20) {
        callback(new Error('密码长度需 6-20 位'))
      } else if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
        callback(new Error('密码必须包含字母与数字'))
      } else if (value === this.passwordForm.oldPassword) {
        callback(new Error('新密码不能与原密码相同'))
      } else {
        if (this.passwordForm.confirmPassword) {
          this.$refs.passwordFormRef.validateField('confirmPassword')
        }
        callback()
      }
    }
    return {
      activeTab: 'profile',
      profileForm: {
        id: 0,
        username: '',
        role: '',
        name: '',
        phone: '',
        email: '',
        avatar: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      profileRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度 2-20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, validator: validateNewPassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirm, trigger: 'blur' }
        ]
      },
      profileSaving: false,
      passwordSaving: false
    }
  },
  computed: {
    avatarText() {
      const name = this.profileForm.name || this.profileForm.username
      return name ? name.charAt(0).toUpperCase() : 'U'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.activeTab = 'profile'
        this.loadProfile()
      }
    }
  },
  methods: {
    async loadProfile() {
      try {
        const data = await getProfile()
        this.profileForm = {
          id: data.id,
          username: data.username,
          role: data.role,
          name: data.name,
          phone: data.phone,
          email: data.email,
          avatar: data.avatar || ''
        }
      } catch (e) {
        this.$message.error('加载个人资料失败')
      }
    },
    handleAvatarUpload() {
      // 业务逻辑待与后端对接：上传到 OSS 后回填 URL
      this.$refs.avatarInput.click()
    },
    onAvatarChange(e) {
      const file = e.target.files[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) {
        this.$message.warning('头像大小不能超过 2MB')
        return
      }
      // 本地预览（占位）
      const reader = new FileReader()
      reader.onload = () => {
        this.profileForm.avatar = reader.result
        // 【业务逻辑待与后端对接：调用上传接口，回填真实 URL】
        this.$message.success('头像已选择，保存后生效')
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    },
    handleSaveProfile() {
      this.$refs.profileFormRef.validate(async valid => {
        if (!valid) return
        this.profileSaving = true
        try {
          await updateProfile({
            name: this.profileForm.name,
            phone: this.profileForm.phone,
            email: this.profileForm.email,
            avatar: this.profileForm.avatar
          })
          this.$message.success('个人资料修改成功')
          // 同步更新 vuex 用户信息：业务逻辑待与后端对接（重新拉取 / 刷新 token）
          try {
            await this.$store.dispatch('user/getInfo')
          } catch (e) {
            // 业务逻辑待与后端对接：刷新失败仅提示，不阻塞关闭浮层
          }
          this.$emit('updated', { ...this.profileForm })
        } catch (e) {
          this.$message.error('保存失败')
        } finally {
          this.profileSaving = false
        }
      })
    },
    handleChangePassword() {
      this.$refs.passwordFormRef.validate(async valid => {
        if (!valid) return
        this.passwordSaving = true
        try {
          const res = await changePassword({
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          })
          if (res && res.success) {
            this.$message.success('密码修改成功，请重新登录')
            this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
            // 业务逻辑待与后端对接：清空 token 后跳转登录
            setTimeout(() => {
              this.$store.dispatch('user/logout').then(() => {
                this.$router.push('/login')
              })
            }, 1000)
          } else {
            this.$message.error((res && res.message) || '密码修改失败')
          }
        } catch (e) {
          this.$message.error('密码修改失败')
        } finally {
          this.passwordSaving = false
        }
      })
    },
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(34, 37, 43, 0.4);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.overlay-panel {
  width: 480px;
  background: $wms-panel;
  border-radius: $wms-radius-md;
  box-shadow: $wms-shadow-lg;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ---------- Header ---------- */
.overlay-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 12px;
  border-bottom: 1px solid $wms-border;

  .header-titles {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .title {
      font-family: $wms-font-heading;
      font-size: $wms-fs-xl;
      font-weight: 600;
      color: $wms-text;
      margin: 0;
      line-height: 1.2;
    }

    .subtitle {
      font-size: $wms-fs-11;
      color: $wms-text-3;
    }
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: $wms-radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $wms-text-3;
    font-size: 16px;
    transition: all 0.15s ease;

    &:hover {
      background: $wms-panel-3;
      color: $wms-danger;
    }
  }
}

/* ---------- Tabs ---------- */
.overlay-tabs {
  padding: 0 24px;
  flex: 1;
  overflow-y: auto;

  ::v-deep .el-tabs__header {
    margin: 0 0 16px;
  }

  ::v-deep .el-tabs__nav-wrap::after {
    height: 1px;
    background: $wms-border;
  }

  ::v-deep .el-tabs__item {
    font-size: $wms-fs-md;
    color: $wms-text-2;
    height: 40px;
    line-height: 40px;

    &.is-active {
      color: $wms-brand;
      font-weight: 600;
    }
  }

  ::v-deep .el-tabs__active-bar {
    background: $wms-brand;
  }
}

/* ---------- Tab1：个人资料 ---------- */
.profile-content {
  padding-bottom: 8px;
}

.avatar-block {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0 20px;

  .avatar-wrap {
    position: relative;
    width: 72px;
    height: 72px;

    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: $wms-brand;
      color: $wms-brand-ink;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: $wms-font-heading;
      font-size: 28px;
      font-weight: 600;
    }

    .avatar-upload {
      position: absolute;
      right: -2px;
      bottom: -2px;
      width: 24px;
      height: 24px;
      border: 2px solid $wms-panel;
      border-radius: 50%;
      background: $wms-brand;
      color: $wms-brand-ink;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;

      &:hover {
        background: $wms-brand-hover;
      }
    }
  }

  .avatar-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .avatar-name {
      font-size: $wms-fs-md;
      font-weight: 600;
      color: $wms-text;
    }

    .avatar-role {
      font-size: $wms-fs-11;
      color: $wms-text-3;
    }
  }
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;

  .form-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .form-label {
      font-size: $wms-fs-sm;
      color: $wms-text-2;
      font-weight: 500;
    }

    .readonly-field {
      height: 36px;
      padding: 0 12px;
      line-height: 36px;
      background: $wms-panel-2;
      border-radius: $wms-radius;
      color: $wms-text-2;
      font-size: $wms-fs-base;
      @include wms-ellipsis;
    }
  }
}

.profile-form,
.password-form {
  ::v-deep .el-form-item__label {
    font-size: $wms-fs-sm;
    color: $wms-text-2;
    font-weight: 500;
    padding-bottom: 4px;
    line-height: 1.4;
  }

  ::v-deep .el-input__inner {
    height: 36px;
    line-height: 36px;
    font-size: $wms-fs-base;
    border-radius: $wms-radius;
    border-color: $wms-border-strong;
    background: $wms-panel;

    &:hover {
      border-color: $wms-brand-hover;
    }

    &:focus {
      border-color: $wms-brand;
    }
  }
}

/* ---------- Tab2：修改密码 ---------- */
.password-content {
  padding: 4px 0 12px;
}

.security-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
  background: $wms-warn-soft;
  border-radius: $wms-radius;
  color: $wms-warn;
  font-size: $wms-fs-125;

  i {
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 1px;
  }
}

/* ---------- Footer ---------- */
.overlay-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid $wms-border;
  background: $wms-panel-3;

  .btn-cancel {
    height: 34px;
    padding: 0 16px;
    border: 1px solid $wms-border-strong;
    background: $wms-panel;
    color: $wms-text-2;
    border-radius: $wms-radius;
    font-size: $wms-fs-base;

    &:hover {
      border-color: $wms-brand-hover;
      color: $wms-brand;
    }
  }

  .btn-save {
    height: 34px;
    padding: 0 20px;
    background: $wms-brand;
    border: none;
    color: $wms-brand-ink;
    border-radius: $wms-radius;
    font-size: $wms-fs-base;
    font-weight: 500;

    &:hover {
      background: $wms-brand-hover;
    }

    &.is-disabled,
    &.is-loading {
      opacity: 0.7;
    }
  }
}

/* ---------- 过渡动画 ---------- */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: all 0.18s ease;
}

.overlay-fade-enter,
.overlay-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}
</style>
