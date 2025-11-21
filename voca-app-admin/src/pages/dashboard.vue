<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-description">欢迎来到 Voca Admin 管理系统</p>
    </div>

    <div class="page-content">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="mb-20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">1,234</div>
                <div class="stat-label">用户总数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">567</div>
                <div class="stat-label">文章总数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32"><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">89,012</div>
                <div class="stat-label">总访问量</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32"><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">+23.5%</div>
                <div class="stat-label">增长率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表和表格 -->
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card header="数据趋势">
            <div class="chart-container">
              <p>图表区域 - 这里可以集成 ECharts 或其他图表库</p>
              <div class="chart-placeholder">
                <el-icon size="64"><TrendCharts /></el-icon>
                <p>数据图表展示区域</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card header="最新动态">
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-content">
                  <div class="activity-title">新用户注册</div>
                  <div class="activity-time">5分钟前</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-content">
                  <div class="activity-title">文章《Vue 3 开发指南》发布</div>
                  <div class="activity-time">1小时前</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-content">
                  <div class="activity-title">系统更新完成</div>
                  <div class="activity-time">2小时前</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-content">
                  <div class="activity-title">备份任务执行成功</div>
                  <div class="activity-time">3小时前</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, Document, View, TrendCharts } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.dashboard {
  .mb-20 {
    margin-bottom: 20px;
  }

  .stat-card {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;

      .stat-icon {
        margin-right: 16px;
        color: #000000;
        background-color: #f0f0f0;
        padding: 12px;
        border-radius: 8px;
      }

      .stat-info {
        .stat-number {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }

  .chart-container {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    background-color: #fafafa;

    .chart-placeholder {
      text-align: center;
      color: #909399;

      .el-icon {
        margin-bottom: 16px;
        color: #c0c4cc;
      }

      p {
        margin: 8px 0 0 0;
        font-size: 14px;
      }
    }
  }

  .activity-list {
    .activity-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .activity-content {
        .activity-title {
          font-size: 14px;
          color: #303133;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .activity-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>