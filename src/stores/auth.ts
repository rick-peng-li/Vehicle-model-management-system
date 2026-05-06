import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Role = 'super_admin' | 'product_manager' | 'match_specialist' | 'user'

export interface User {
  id: string
  name: string
  role: Role
  department?: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User>({
    id: '1',
    name: '超级管理员',
    role: 'super_admin',
    department: '总部',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg'
  })

  const isAuthenticated = ref(true)

  const roles = {
    super_admin: {
      name: '超级管理员',
      permissions: ['*'],
      // All routes accessible
      routes: ['dashboard', 'product', 'car', 'matching', 'files', 'users', 'settings', 'themesettings', 'datadictionary', 'systemconfig']
    },
    product_manager: {
      name: '产品经理',
      permissions: ['product:view', 'product:edit', 'car:view', 'car:edit', 'files:view', 'files:upload'],
      routes: ['dashboard', 'product', 'car', 'files', 'settings', 'themesettings']
    },
    match_specialist: {
      name: '匹配专员',
      permissions: ['match:view', 'match:edit', 'product:view', 'car:view'],
      routes: ['dashboard', 'matching', 'product', 'car', 'settings', 'themesettings']
    },
    user: {
      name: '普通用户',
      permissions: ['product:view', 'car:view', 'match:view', 'files:view'],
      routes: ['dashboard', 'product', 'car', 'matching', 'files', 'settings', 'themesettings']
    }
  }

  const currentRole = computed(() => roles[user.value.role])

  const hasPermission = (permission: string) => {
    if (!user.value || !currentRole.value) return false
    
    // Super admin has all permissions
    if (currentRole.value.permissions.includes('*')) return true
    
    return currentRole.value.permissions.includes(permission)
  }

  const canAccessRoute = (routeName: string) => {
    if (!user.value || !currentRole.value) return false
    // Super admin has all routes
    if (currentRole.value.permissions.includes('*')) return true
    
    const normalizedRoute = routeName.toLowerCase()
    return currentRole.value.routes.includes(normalizedRoute)
  }

  const login = (role: Role) => {
    user.value = {
      id: Date.now().toString(),
      name: roles[role].name,
      role: role,
      department: role === 'super_admin' ? '总部' : '区域一',
      avatar: `https://randomuser.me/api/portraits/${role === 'user' ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`
    }
    isAuthenticated.value = true
  }

  const logout = () => {
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    currentRole,
    hasPermission,
    canAccessRoute,
    login,
    logout
  }
})
