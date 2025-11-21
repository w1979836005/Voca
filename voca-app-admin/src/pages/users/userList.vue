<template>
  <div class="user-list">
    <div class="page-header">
      <h1 class="page-title">用户列表</h1>
      <p class="page-description">管理系统中的所有用户</p>
    </div>

    <div class="page-content">
      <!-- 搜索和操作区域 -->
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 用户表格 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>用户列表</span>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
          </div>
        </template>

        <el-table :data="userList" stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
                {{ row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                :type="row.status === 'active' ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'

interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'disabled'
  createdAt: string
}

interface SearchForm {
  username: string
  status: string
}

const searchForm = reactive<SearchForm>({
  username: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const userList = ref<User[]>([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-02 14:30:00'
  },
  {
    id: 3,
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'disabled',
    createdAt: '2024-01-03 09:15:00'
  }
])

const loadUserList = () => {
  // 模拟API调用
  pagination.total = 100
  ElMessage.success('用户列表加载成功')
}

const handleSearch = () => {
  pagination.current = 1
  loadUserList()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  ElMessage.info('跳转到添加用户页面')
}

const handleEdit = (user: User) => {
  ElMessage.info(`编辑用户: ${user.username}`)
}

const handleToggleStatus = (user: User) => {
  const action = user.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确定要${action}用户 "${user.username}" 吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    const index = userList.value.findIndex(item => item.id === user.id)
    if (index > -1) {
      userList.value[index].status = user.status === 'active' ? 'disabled' : 'active'
    }
    ElMessage.success(`用户${action}成功`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleDelete = (user: User) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.username}" 吗？此操作不可恢复！`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    // 模拟API调用
    const index = userList.value.findIndex(item => item.id === user.id)
    if (index > -1) {
      userList.value.splice(index, 1)
    }
    ElMessage.success('用户删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  loadUserList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadUserList()
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped lang="scss">
.user-list {
  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>