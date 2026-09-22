const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),

    children: [
      {
        path: '',
        component: () => import('@/pages/IndexPage.vue')
      },

      {
        path: 'home',
        component: () => import('@/pages/HomePage.vue')
      }
    ]
  },

  // ==============================
  // SMART TROLLEY
  // ==============================
  {
    path: '/trolley',
    component: () => import('@/layouts/SmarttrolleyLayout.vue'),

    children: [
      // Dashboard
      {
        path: '',
        component: () => import('@/pages/smart-trolley/TrolleyPage.vue')
      },

      // Controller
      {
        path: 'controller',
        component: () => import('@/pages/smart-trolley/TrolleyPage.vue')
      },

      // Monitoring
      {
        path: 'monitoring',
        component: () => import('@/pages/smart-trolley/MonitoringPage.vue')
      },

      // Simulator
      {
        path: 'simulator',
        component: () => import('@/pages/smart-trolley/TrolleySimulator.vue')
      }
    ]
  },

  // ==============================
  // 404
  // ==============================
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue')
  }
]

export default routes
