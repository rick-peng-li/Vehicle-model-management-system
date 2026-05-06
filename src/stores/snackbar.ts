import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnackbarStore = defineStore('snackbar', () => {
  const show = ref(false)
  const message = ref('')
  const color = ref('success')
  const timeout = ref(3000)

  function showMessage(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
    message.value = msg
    color.value = type
    show.value = true
  }

  return { show, message, color, timeout, showMessage }
})
