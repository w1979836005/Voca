import { createRouter, createWebHistory } from 'vue-router'
import defaultLayout from '@/layouts/defaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: defaultLayout,
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/pages/dashboard.vue'),
          meta: {
            title: '仪表盘'
          }
        },
        {
          path: '/users/list',
          name: 'UserList',
          component: () => import('@/pages/users/userList.vue'),
          meta: {
            title: '用户列表'
          }
        },
        {
          path: '/users/create',
          name: 'UserCreate',
          component: () => import('@/pages/users/userCreate.vue'),
          meta: {
            title: '添加用户'
          }
        },
        {
          path: '/content/articles',
          name: 'Articles',
          component: () => import('@/pages/content/articles.vue'),
          meta: {
            title: '文章管理'
          }
        },
        {
          path: '/content/categories',
          name: 'Categories',
          component: () => import('@/pages/content/categories.vue'),
          meta: {
            title: '分类管理'
          }
        },
        {
          path: '/content/tags',
          name: 'Tags',
          component: () => import('@/pages/content/tags.vue'),
          meta: {
            title: '标签管理'
          }
        },
        {
          path: '/settings/basic',
          name: 'BasicSettings',
          component: () => import('@/pages/settings/basic.vue'),
          meta: {
            title: '基础设置'
          }
        },
        {
          path: '/settings/permissions',
          name: 'Permissions',
          component: () => import('@/pages/settings/permissions.vue'),
          meta: {
            title: '权限管理'
          }
        },
        {
          path: '/settings/logs',
          name: 'Logs',
          component: () => import('@/pages/settings/logs.vue'),
          meta: {
            title: '操作日志'
          }
        },
        {
          path: '/analytics',
          name: 'Analytics',
          component: () => import('@/pages/analytics.vue'),
          meta: {
            title: '数据分析'
          }
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/pages/profile.vue'),
          meta: {
            title: '个人中心'
          }
        }
      ]
    }
  ],
})

export default router
