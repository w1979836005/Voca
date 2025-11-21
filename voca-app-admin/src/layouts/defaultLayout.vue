<template>
  <div class="default-layout">
    <!-- 左侧边栏 -->
    <sidebar :collapse="isCollapse" class="sidebar" />

    <!-- 主内容区 -->
    <div class="main-container" :class="{ 'main-container-collapse': isCollapse }">
      <!-- 顶部导航栏 -->
      <myheader @toggle-sidebar="toggleSidebar" class="header" :style="{ left: isCollapse ? '64px' : '280px' }" />
      <!-- 内容区域 -->
      <main class="content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import sidebar from '@/components/layout/sidebar.vue'
import Myheader from '@/components/layout/Myheader.vue'

const isCollapse = ref(false)

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped lang="scss">
.default-layout {
  width: 100%;
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;

  .sidebar {
    width: 280px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transition: width 0.3s ease;
  }

  .main-container {
    flex: 1;
    margin-left: 280px;
    transition: margin-left 0.3s ease;
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    &.main-container-collapse {
      margin-left: 64px;
    }

    .header {
      position: fixed;
      top: 0;
      right: 0;
      left: 280px;
      z-index: 1000;
      transition: left 0.3s ease;
    }

    .content {
      width: 100%;
      margin-top: 60px;
      padding: 20px;
      background-color: #f0f2f5;
      min-height: calc(100vh - 60px);
      box-sizing: border-box;
    }
  }
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 响应式设计
@media (max-width: 768px) {
  .default-layout {
    .main-container {
      margin-left: 0;

      .header {
        left: 0;
      }
    }

    .sidebar {
      transform: translateX(-100%);
      z-index: 1002;

      &.mobile-show {
        transform: translateX(0);
      }
    }

    .main-container-collapse {
      margin-left: 0;

      .header {
        left: 0;
      }
    }
  }
}

@media (max-width: 576px) {
  .default-layout {
    .main-container {
      .content {
        padding: 12px;
      }
    }
  }
}
</style>

<style lang="scss">
// 全局样式调整
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-primary);
  background-color: #f0f2f5;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

// Element Plus 样式调整
.el-card {
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

  .el-card__header {
    border-bottom: 1px solid #ebeef5;
    background-color: #fafafa;
    font-weight: 500;
  }
}

.el-table {
  .el-table__header {
    th {
      background-color: #fafafa;
      color: #303133;
      font-weight: 500;
    }
  }
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

// 页面内容容器
.page-container {
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.page-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #ffffff;

  .page-title {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
  }

  .page-description {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.page-content {
  padding: 20px;
}
</style>
