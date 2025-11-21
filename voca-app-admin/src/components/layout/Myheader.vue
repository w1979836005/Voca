<template>
  <div class="header">
    <div class="header-left">
      <el-button
        :icon="Expand"
        @click="toggleSidebar"
        text
        class="collapse-btn"
      />
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item
          v-for="item in breadcrumbList"
          :key="item.path"
          :to="item.path"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-tooltip content="搜索" placement="bottom">
        <el-button :icon="Search" text class="header-btn" @click="handleSearch" />
      </el-tooltip>

      <el-tooltip content="全屏" placement="bottom">
        <el-button :icon="FullScreen" text class="header-btn" @click="toggleFullscreen" />
      </el-tooltip>

      <el-tooltip content="通知" placement="bottom">
        <el-badge :value="3" :max="99" class="notification-badge">
          <el-button :icon="Bell" text class="header-btn" @click="handleNotification" />
        </el-badge>
      </el-tooltip>

      <el-dropdown @command="handleUserCommand" class="user-dropdown">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo.avatar" />
          <span class="username">{{ userInfo.name }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Expand,
  Search,
  FullScreen,
  Bell,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface UserInfo {
  name: string
  avatar: string
}

interface BreadcrumbItem {
  title: string
  path: string
}

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const router = useRouter()

const userInfo = ref<UserInfo>({
  name: 'Admin User',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

const breadcrumbList = ref<BreadcrumbItem[]>([])

// 面包屑导航生成
const generateBreadcrumb = () => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  breadcrumbList.value = matched.map(item => ({
    title: item.meta.title as string,
    path: item.path
  }))
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    generateBreadcrumb()
  },
  { immediate: true }
)

// 切换侧边栏
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// 搜索功能
const handleSearch = () => {
  ElMessage.info('搜索功能开发中...')
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    ElMessage.success('进入全屏模式')
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      ElMessage.success('退出全屏模式')
    }
  }
}

// 通知功能
const handleNotification = () => {
  ElMessage.info('通知中心功能开发中...')
}

// 用户下拉菜单操作
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      ElMessage.success('退出登录成功')
      router.push('/login')
      break
    default:
      break
  }
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  .header-left {
    display: flex;
    align-items: center;

    .collapse-btn {
      margin-right: 20px;
      color: #606266;

      &:hover {
        color: #000000;
      }
    }

    .breadcrumb {
      :deep(.el-breadcrumb__item) {
        .el-breadcrumb__inner {
          color: #606266;
          font-weight: normal;

          &:hover {
            color: #000000;
          }
        }

        &:last-child .el-breadcrumb__inner {
          color: #000000;
          font-weight: 500;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;

    .header-btn {
      margin-left: 8px;
      color: #606266;
      font-size: 16px;

      &:hover {
        color: #000000;
      }
    }

    .notification-badge {
      margin-left: 8px;

      :deep(.el-badge__content) {
        background-color: #f56c6c;
        border-color: #ffffff;
      }
    }

    .user-dropdown {
      margin-left: 16px;

      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        .username {
          margin: 0 8px;
          color: #303133;
          font-weight: 500;
        }

        .dropdown-icon {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header {
    padding: 0 12px;

    .header-left {
      .breadcrumb {
        display: none;
      }
    }

    .header-right {
      .username {
        display: none;
      }
    }
  }
}

// Element Plus 下拉菜单样式
:deep(.el-dropdown-menu) {
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;

    .el-icon {
      margin-right: 8px;
      color: #606266;
    }

    &:hover {
      .el-icon {
        color: #000000;
      }
    }
  }
}
</style>
