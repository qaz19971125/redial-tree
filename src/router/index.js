import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

/**
 * 常用路由
 * 不需要权限的路由
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/login.vue'),
    hidden: true,
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true,
  },

  {
    path: '/',
    component: Layout,
    redirect: '/radial-tree',
    children: [
      {
        path: 'radial-tree',
        name: 'RadialTree',
        component: () => import('@/views/radial-tree/index'),
        meta: { title: '环形辐射树' },
      },
    ],
  },

  {
    path: '/force-chart',
    component: Layout,
    children: [
      {
        path: '',
        name: 'ForceChart',
        component: () => import('@/views/force-chart/index'),
        meta: { title: '力导图' },
      },
    ],
  },

  { path: '*', redirect: '/404', hidden: true },
]

const createRouter = () =>
  new Router({
    // mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes,
  })

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
