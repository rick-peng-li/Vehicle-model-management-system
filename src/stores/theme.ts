import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or default to light
  const storedTheme = localStorage.getItem('theme_mode') as 'light' | 'dark' | null
  const isDark = ref(storedTheme === 'dark')

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme_mode', isDark.value ? 'dark' : 'light')
  }

  const setDark = (value: boolean) => {
    isDark.value = value
    localStorage.setItem('theme_mode', value ? 'dark' : 'light')
  }

  return {
    isDark,
    toggleTheme,
    setDark
  }
})
