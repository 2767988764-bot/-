<template>
  <div class="wms-page">
    <div class="page-head">
      <h1 class="wms-page-title">仓库盘点</h1>
      <p class="wms-page-desc">核对账面数量与实盘数量，掌握盘盈盘亏情况</p>
    </div>
    <SearchFilterBar>
      <template #filters>
        <el-input v-model="query.keyword" placeholder="搜索货号 / 货物名称" clearable style="width:240px" @keyup.enter.native="onSearch" />
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </template>
      <template #actions>
        <el-button type="primary" icon="el-icon-document" @click="loadData">刷新盘点</el-button>
      </template>
    </SearchFilterBar>
    <div class="wms-card">
      <el-table :data="tableData" v-loading="loading" border style="width:100%">
        <el-table-column prop="goodsNo" label="货号" min-width="180" />
        <el-table-column prop="goodsName" label="货物名称" min-width="150" />
        <el-table-column prop="warehouse" label="仓库" min-width="150" />
        <el-table-column prop="bookQuantity" label="账面数量" width="110" align="right" />
        <el-table-column prop="actualQuantity" label="实盘数量" width="110" align="right" />
        <el-table-column label="备注" min-width="140" align="center">
          <template slot-scope="{ row }">
            <span :class="remarkClass(row)">{{ row.remark }}</span>
          </template>
        </el-table-column>
        <template slot="empty">暂无盘点记录</template>
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
 * 仓库盘点页
 */
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import { getInventoryCheckList } from '@/api/stock'

export default {
  name: 'InventoryCheck',
  components: { SearchFilterBar },
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
        const res = await getInventoryCheckList(this.query)
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
    remarkClass(row) {
      // 业务逻辑待后端对接时完善：盘盈/盘亏/账实相符状态分类
      if (row.remark && row.remark.indexOf('盘亏') > -1) return 'remark-loss'
      if (row.remark && row.remark.indexOf('盘盈') > -1) return 'remark-gain'
      return 'remark-ok'
    }
  }
}
</script>

<style lang="scss" scoped>
.page-head {
  margin-bottom: 16px;
}

.remark-ok {
  color: $wms-ok;
  font-size: $wms-fs-sm;
}

.remark-gain {
  color: $wms-info;
  font-size: $wms-fs-sm;
}

.remark-loss {
  color: $wms-danger;
  font-size: $wms-fs-sm;
}
</style>
