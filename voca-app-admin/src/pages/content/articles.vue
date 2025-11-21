<template>
  <div class="articles">
    <div class="page-header">
      <h1 class="page-title">文章管理</h1>
      <p class="page-description">管理系统中的所有文章内容</p>
    </div>

    <div class="page-content">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>文章列表</span>
            <el-button type="primary">
              <el-icon><Plus /></el-icon>
              新建文章
            </el-button>
          </div>
        </template>

        <el-table :data="articleList" stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" min-width="200" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small">编辑</el-button>
              <el-button type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

interface Article {
  id: number
  title: string
  category: string
  status: string
  createdAt: string
}

const articleList = ref<Article[]>([
  {
    id: 1,
    title: 'Vue 3 开发指南',
    category: '前端开发',
    status: 'published',
    createdAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    title: 'Element Plus 组件库使用',
    category: '前端开发',
    status: 'draft',
    createdAt: '2024-01-02 14:30:00'
  }
])

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    published: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return textMap[status] || '未知'
}
</script>

<style scoped lang="scss">
.articles {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>