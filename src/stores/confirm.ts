import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
  const show = ref(false)
  const title = ref('')
  const content = ref('')
  const confirmText = ref('')
  const cancelText = ref('')
  
  let resolvePromise: (value: boolean) => void = () => {}

  const confirm = (message: string, options: { title?: string, confirmText?: string, cancelText?: string } = {}) => {
    content.value = message
    title.value = options.title || '确认'
    confirmText.value = options.confirmText || '确认'
    cancelText.value = options.cancelText || '取消'
    show.value = true
    
    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    show.value = false
    resolvePromise(true)
  }

  const handleCancel = () => {
    show.value = false
    resolvePromise(false)
  }

  return {
    show,
    title,
    content,
    confirmText,
    cancelText,
    confirm,
    handleConfirm,
    handleCancel
  }
})
