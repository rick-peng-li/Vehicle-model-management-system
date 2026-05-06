import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export interface UploadTask {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'paused' | 'error' | 'completed'
  errorMessage?: string
  uploadedChunks: number
  totalChunks: number
  type: 'data' | 'image'
  speed: string
  remainingTime: string
}

export interface HistoryItem {
  id: string
  fileName: string
  fileSize: string
  type: 'data' | 'image'
  status: 'success' | 'failed'
  date: string
  error?: string
  operator: string
  department?: string
}

export const useFilesStore = defineStore('files', () => {
  const authStore = useAuthStore()
  const uploadTasks = ref<UploadTask[]>([])
  const history = ref<HistoryItem[]>([
    {
      id: '1',
      fileName: 'products_v1.xlsx',
      fileSize: '2.5 MB',
      type: 'data',
      status: 'success',
      date: '2024-05-20 10:30:00',
      operator: 'Admin',
      department: '区域一'
    },
    {
      id: '2',
      fileName: 'car_images_batch.zip',
      fileSize: '45.2 MB',
      type: 'image',
      status: 'failed',
      date: '2024-05-19 15:20:00',
      error: '网络连接超时',
      operator: 'System',
      department: '区域二'
    }
  ])
  const historyTotal = ref(30)
  const historyPage = ref(1)
  const historyLoading = ref(false)

  // Simulation constants
  const CHUNK_SIZE = 1024 * 1024 // 1MB
  const UPLOAD_SPEED_BASE = 500 * 1024 // 500KB/s base speed
  
  // Active intervals for tasks
  const activeUploads = new Map<string, any>()

  const loadHistory = async (reset = false) => {
    if (reset) {
      historyPage.value = 1
      history.value = []
    }
    historyLoading.value = true
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Generate mock history items
    const newItems = Array.from({ length: 10 }, (_, i) => {
      const id = Date.now() + i + Math.random()
      const isSuccess = Math.random() > 0.2
      const departments = ['区域一', '区域二', '区域三']
      return {
        id: id.toString(),
        fileName: `import_file_${historyPage.value}_${i + 1}.${Math.random() > 0.5 ? 'xlsx' : 'zip'}`,
        fileSize: Math.floor(Math.random() * 50 + 1) + ' MB',
        type: Math.random() > 0.5 ? 'data' : 'image',
        status: isSuccess ? 'success' : 'failed',
        date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleString(),
        error: isSuccess ? undefined : 'Import failed due to data error',
        operator: Math.random() > 0.5 ? 'Admin' : 'System',
        department: departments[i % 3]
      } as HistoryItem
    })

    // Filter by department if not super_admin
    const filteredItems = newItems.filter(item => {
      if (authStore.user && authStore.user.role !== 'super_admin') {
        return item.department === authStore.user.department
      }
      return true
    })

    if (reset) {
      history.value = filteredItems
    } else {
      history.value.push(...filteredItems)
    }
    
    historyTotal.value = 50 // Fixed mock total
    if (history.value.length < historyTotal.value) {
      historyPage.value++
    }
    
    historyLoading.value = false
  }


  const addUploadTask = (files: File[], type: 'data' | 'image') => {
    files.forEach(file => {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      const task: UploadTask = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending',
        uploadedChunks: 0,
        totalChunks,
        type,
        speed: '0 KB/s',
        remainingTime: '--'
      }
      uploadTasks.value.unshift(task)
      startUpload(task.id)
    })
  }

  const startUpload = (id: string) => {
    const task = uploadTasks.value.find(t => t.id === id)
    if (!task || task.status === 'completed') return

    task.status = 'uploading'
    
    // Simulate upload process
    const interval = setInterval(() => {
      if (task.status !== 'uploading') {
        clearInterval(interval)
        return
      }

      // Simulate network fluctuation and error
      if (Math.random() < 0.05) { // 5% chance of error
        task.status = 'error'
        task.errorMessage = '网络连接中断，请检查网络设置'
        clearInterval(interval)
        activeUploads.delete(id)
        return
      }

      // Simulate progress
      const chunkSize = CHUNK_SIZE
      const uploaded = task.uploadedChunks * chunkSize
      const remaining = task.file.size - uploaded
      
      if (remaining <= 0) {
        task.progress = 100
        task.status = 'completed'
        task.uploadedChunks = task.totalChunks
        clearInterval(interval)
        activeUploads.delete(id)
        addToHistory(task, 'success')
        // Remove from tasks list after delay or keep it? 
        // Let's keep it for a moment or move to history immediately?
        // Usually UI shows "Completed" for a while.
      } else {
        // Increment chunks
        task.uploadedChunks++
        task.progress = Math.min(100, Math.round((task.uploadedChunks / task.totalChunks) * 100))
        
        // Calculate speed (mock)
        const currentSpeed = UPLOAD_SPEED_BASE * (0.8 + Math.random() * 0.4) // +/- 20%
        task.speed = formatSize(currentSpeed) + '/s'
        
        // Calculate remaining time
        const remainingBytes = task.file.size - (task.uploadedChunks * chunkSize)
        const seconds = remainingBytes / currentSpeed
        task.remainingTime = formatTime(seconds)
      }
    }, 500) // Update every 500ms

    activeUploads.set(id, interval)
  }

  const pauseUpload = (id: string) => {
    const task = uploadTasks.value.find(t => t.id === id)
    if (task && task.status === 'uploading') {
      task.status = 'paused'
      const interval = activeUploads.get(id)
      if (interval) {
        clearInterval(interval)
        activeUploads.delete(id)
      }
    }
  }

  const resumeUpload = (id: string) => {
    const task = uploadTasks.value.find(t => t.id === id)
    if (task && (task.status === 'paused' || task.status === 'error')) {
      startUpload(id)
    }
  }

  const retryUpload = (id: string) => {
    const task = uploadTasks.value.find(t => t.id === id)
    if (task) {
      task.status = 'pending'
      task.errorMessage = undefined
      startUpload(id)
    }
  }

  const removeTask = (id: string) => {
    const interval = activeUploads.get(id)
    if (interval) clearInterval(interval)
    activeUploads.delete(id)
    
    const index = uploadTasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      uploadTasks.value.splice(index, 1)
    }
  }

  const addToHistory = (task: UploadTask, status: 'success' | 'failed', error?: string) => {
    history.value.unshift({
      id: Date.now().toString(),
      fileName: task.file.name,
      fileSize: formatSize(task.file.size),
      type: task.type,
      status,
      date: new Date().toLocaleString(),
      error,
      operator: 'Current User'
    })
  }

  // Helpers
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return '--'
    if (seconds < 60) return Math.ceil(seconds) + 's'
    const mins = Math.floor(seconds / 60)
    return mins + 'm ' + Math.ceil(seconds % 60) + 's'
  }

  return {
    uploadTasks,
    history,
    historyTotal,
    historyLoading,
    loadHistory,
    addUploadTask,
    pauseUpload,
    resumeUpload,
    retryUpload,
    removeTask,
    formatSize
  }
})
