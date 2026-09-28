<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">操作日志</h1>
      <p class="wms-page-desc">记录系统关键操作，便于审计追溯</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索用户 / 操作内容" clearable style="width:240px" @keyup.enter.native="onSearch" />
        <el-select v-model="query.result" placeholder="结果" clearable style="width:140px">
          <el-option label="成功" value="成功" />
          <el-option label="失败" value="失败" />
        </el-select>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="time" label="时间" min-width="170" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="operation" label="操作内容" min-width="240" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" min-width="150" />
        <el-table-column label="结果" width="100" align="center">
          <template slot-scope="{ row }">
            <StatusTag :status="row.result" />
          </template>
        </el-table-column>
        <template slot="empty">暂无操作日志</template>
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
 * 操作日志列表页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import StatusTag from '@/components/StatusTag.vue'
import { getOperationLogs } from '@/api/monitor'

export default {
  name: 'OperationLog',
  components: { SearchFilterBar, StatusTag },
  data() {
    return {
      loading: false,
      query: { keyword: '', result: '', page: 1, pageSize: 10 },
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
      this.query = { keyword: '', result: '', page: 1, pageSize: 10 }
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getOperationLogs(this.query)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.page-head {
  margin-bottom: 16px;
}
</style>
