import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useMatchingStore = defineStore('matching', () => {
  const loading = ref(false)
  const authStore = useAuthStore()
  
  // Rules State
  const rules = ref({
    categories: ['机油', '机滤'],
    attributes: ['品牌', '车系'],
    threshold: 80
  })

  // Internal Pending Matches State
  const _pendingMatches = ref<any[]>([
    {
      id: 1001,
      productName: '美孚1号全合成机油 5W-40',
      carName: '大众 帕萨特 330TSI',
      confidence: 92,
      status: 'pending',
      department: '区域一'
    },
    {
      id: 1002,
      productName: '博世(BOSCH)刹车片',
      carName: '丰田 凯美瑞 2.5G',
      confidence: 85,
      status: 'pending',
      department: '区域一'
    },
    {
      id: 1003,
      productName: '马勒(MAHLE)机油滤清器',
      carName: '宝马 3系 325i',
      confidence: 88,
      status: 'pending',
      department: '总部'
    }
  ])

  // Internal History State
  const _history = ref<any[]>([
    { id: 1, type: '自动匹配', count: 150, date: '2024-05-20', user: 'Admin', status: '已完成', department: '总部' },
    { id: 2, type: '自动匹配', count: 86, date: '2024-05-19', user: 'System', status: '已完成', department: '区域一' },
    { id: 3, type: '人工审核', count: 12, date: '2024-05-18', user: 'Admin', status: '已完成', department: '区域一' }
  ])

  // Computed Properties for Data Isolation
  const pendingMatches = computed(() => {
    if (!authStore.user || authStore.user.role === 'super_admin') {
      return _pendingMatches.value
    }
    return _pendingMatches.value.filter(m => m.department === authStore.user.department)
  })

  const history = computed(() => {
    if (!authStore.user || authStore.user.role === 'super_admin') {
      return _history.value
    }
    return _history.value.filter(h => h.department === authStore.user.department)
  })

  // Actions
  const saveRules = async (newRules: any) => {
    loading.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    rules.value = { ...newRules }
    loading.value = false
  }

  const runAutoMatch = async () => {
    loading.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock generating pending matches for current department
    const department = authStore.user?.department || '总部'
    const newMatches = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      productName: `待匹配产品 ${String.fromCharCode(65 + i)}`,
      carName: `适配车型 ${i + 1}`,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      status: 'pending',
      department
    }))
    
    _pendingMatches.value = [...newMatches, ..._pendingMatches.value]
    
    // Add to history
    _history.value.unshift({
      id: Date.now(),
      type: '自动匹配',
      count: newMatches.length,
      date: new Date().toISOString().split('T')[0],
      user: authStore.user?.name || 'Current User',
      status: '待审核',
      department
    })
    
    loading.value = false
  }

  const approveMatch = async (id: number) => {
    // Remove from internal state
    const index = _pendingMatches.value.findIndex(m => m.id === id)
    if (index !== -1) {
      const match = _pendingMatches.value[index]
      _pendingMatches.value.splice(index, 1)
      
      // Add to history
      _history.value.unshift({
        id: Date.now(),
        type: '人工审核',
        count: 1,
        date: new Date().toISOString().split('T')[0],
        user: authStore.user?.name || 'Current User',
        status: '已完成',
        department: match.department
      })
    }
  }

  const rejectMatch = async (id: number) => {
    // Remove from internal state
    const index = _pendingMatches.value.findIndex(m => m.id === id)
    if (index !== -1) {
      _pendingMatches.value.splice(index, 1)
    }
  }

  const approveAll = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Approve all VISIBLE matches
    const matchesToApprove = pendingMatches.value
    
    if (matchesToApprove.length > 0) {
      // Add to history
      _history.value.unshift({
        id: Date.now(),
        type: '人工审核',
        count: matchesToApprove.length,
        date: new Date().toISOString().split('T')[0],
        user: authStore.user?.name || 'Current User',
        status: '已完成',
        department: authStore.user?.department || '总部'
      })
      
      // Remove approved matches from internal state
      const approvedIds = matchesToApprove.map(m => m.id)
      _pendingMatches.value = _pendingMatches.value.filter(m => !approvedIds.includes(m.id))
    }
    
    loading.value = false
  }

  return {
    loading,
    rules,
    pendingMatches,
    history,
    saveRules,
    runAutoMatch,
    approveMatch,
    rejectMatch,
    approveAll
  }
})
