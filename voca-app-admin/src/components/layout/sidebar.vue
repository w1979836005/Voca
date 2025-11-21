<template>
  <div class="sidebar" :class="{ 'is-collapse': isCollapse }">
    <div class="logo">
      <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
      <span class="logo-text" v-show="!isCollapse">Voca Admin</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="isCollapse"
      :unique-opened="true"
      router
      background-color="#000000"
      text-color="#ffffff"
      active-text-color="#ffffff"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Monitor /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>

      <el-sub-menu index="1">
        <template #title>
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/users/list">用户列表</el-menu-item>
        <el-menu-item index="/users/create">添加用户</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>内容管理</span>
        </template>
        <el-menu-item index="/content/articles">文章管理</el-menu-item>
        <el-menu-item index="/content/categories">分类管理</el-menu-item>
        <el-menu-item index="/content/tags">标签管理</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </template>
        <el-menu-item index="/settings/basic">基础设置</el-menu-item>
        <el-menu-item index="/settings/permissions">权限管理</el-menu-item>
        <el-menu-item index="/settings/logs">操作日志</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/analytics">
        <el-icon><TrendCharts /></el-icon>
        <template #title>数据分析</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Monitor,
  User,
  Document,
  Setting,
  TrendCharts
} from '@element-plus/icons-vue'

interface Props {
  collapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapse: false
})

const route = useRoute()
const isCollapse = computed(() => props.collapse)
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #000000;
  border-right: 1px solid #333333;
  transition: width 0.3s ease;

  &.is-collapse {
    width: 64px !important;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    padding: 0 16px;
    border-bottom: 1px solid #333333;
    background-color: #000000;

    .logo-img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    .logo-text {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      font-family: var(--font-primary);
      white-space: nowrap;
    }
  }

  .sidebar-menu {
    border-right: none;
    background-color: #000000;
    width: 100%;
    transition: width 0.3s ease;

    :deep(.el-menu-item) {
      color: #ffffff;

      &:hover {
        background-color: #333333 !important;
      }

      &.is-active {
        background-color: #ffffff !important;
        color: #000000 !important;

        .el-icon {
          color: #000000 !important;
        }
      }
    }

    :deep(.el-sub-menu) {
      .el-sub-menu__title {
        color: #ffffff;

        &:hover {
          background-color: #333333 !important;
        }
      }

      .el-menu {
        background-color: #111111;

        .el-menu-item {
          color: #cccccc;

          &:hover {
            background-color: #333333 !important;
            color: #ffffff !important;
          }

          &.is-active {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
        }
      }
    }
  }
}

/* 折叠状态下的样式调整 */
.sidebar {
  &.is-collapse {
    min-width: 64px !important;
    max-width: 64px !important;

    .sidebar-menu {
      width: 100% !important;
      min-width: 64px !important;
      max-width: 64px !important;
    }
  }

  :deep(.el-menu--collapse) {
    width: 64px !important;
    min-width: 64px !important;
    max-width: 64px !important;

    .el-sub-menu__title {
      span {
        display: none;
      }
    }
  }
}

/* 图标颜色统一 */
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  color: inherit;
}
</style>
