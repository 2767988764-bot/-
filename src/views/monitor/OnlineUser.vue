<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">在线用户</h1>
      <p class="wms-page-desc">查看当前登录用户并支持强制下线</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索用户 / 角色" clearable style="width:240px" @keyup.enter.native="onSearch" />
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="user" label="用户" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="140" />
        <el-table-column prop="ip" label="IP地址" min-width="150" />
        <el-table-column prop="loginTime" label="登录时间" min-width="170" />
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              class="wms-text-danger"
              :disabled="row.status !== '在线'"
              @click="handleForceLogout(row)"
            >
              强制下线
            </el-button>
          </template>
        </el-table-column>
        <template slot="empty">暂无在线用户</template>
      </el-table>
      <div class="wms-table-footer">
        <span class="wms-footer-info">{{ footerText }}</span>
        <el-pagination
          background
          layout="prev,pager,next,sizes,total"
          :current-page="query.page"
          :page-size="query.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          @current-change="onPage"
          @size-change="onSize"
        />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 在线用户列表页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import StatusTag from '@/components/StatusTag.vue'
import { getOnlineUsers, forceLogout } from '@/api/monitor'

export default {
  name: 'OnlineUser',
  components: { SearchFilterBar, StatusTag },
  data() {
    return {
      loading: false,
      query: { keyword: '', page: 1, pageSize: 10 },
      tableData: [],
      total: 0
    }
  },
  computed: {
    footerText() {
      const { total } = this
      const { page, pageSize } = this.query
      const from = total === 0 ? 0 : (page - 1) * pageSize + 1
      const to = Math.min(page * pageSize, total)
      return `共 ${total} 条记录，当前显示 ${from}-${to} 条`
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    onSearch() {
      this.query.page = 1
      this.loadData()
    },
    resetQuery() {
      this.query = { keyword: '', page: 1, pageSize: 10 }
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getOnlineUsers(this.query)
        this.tableData = res.list || []
        this.total = res.total || 0
      } finally {
        this.loading = false
      }
    },
    onPage(p) {
      this.query.page = p
      this.loadData()
    },
    onSize(s) {
      this.query.pageSize = s
      this.query.page = 1
      this.loadData()
    },
    handleForceLogout(row) {
      // 业务逻辑待后端对接时完善：强制下线需记录操作日志并通知被下线会话
      this.$confirm(`确认强制下线用户「${row.user}」？`, '提示', { type: 'warning' })
        .then(() => forceLogout(row.id))
        .then(() => {
          this.$message.success('已强制下线')
          this.loadData()
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.page-head {
  margin-bottom: 16px;
}
</style>
