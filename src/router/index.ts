import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard
        },
        {
          path: 'product',
          name: 'Product',
          component: () => import('../views/Product.vue')
        },
        {
          path: 'car',
          name: 'Car',
          component: () => import('../views/Car.vue')
        },
        {
          path: 'matching',
          name: 'Matching',
          component: () => import('../views/Matching.vue')
        },
        {
          path: 'files',
          name: 'Files',
          component: () => import('../views/Files.vue')
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('../views/Users.vue')
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../views/Settings.vue')
        },
        {
          path: 'theme-settings',
          name: 'ThemeSettings',
          component: () => import('../views/ThemeSettings.vue')
        },
        {
          path: 'data-dictionary',
          name: 'DataDictionary',
          component: () => import('../views/DataDictionary.vue')
        },
        {
          path: 'system-config',
          name: 'SystemConfig',
          component: () => import('../views/SystemConfig.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Public pages
  if (to.name === 'Login') {
    next()
    return
  }

  // Check authentication
  if (!authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }

  // Check route permission
  if (to.name && !authStore.canAccessRoute(to.name.toString())) {
    // Redirect to dashboard if user has access to it, otherwise stay or go to login
    // If already on dashboard (and no access?), that would be a loop if not handled.
    // But all roles seem to have dashboard access in auth.ts.
    if (to.name !== 'Dashboard') {
       next({ name: 'Dashboard' })
       return
    }
  }

  next()
})

export default router
