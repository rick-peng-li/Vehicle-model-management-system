<template>
  <router-view></router-view>
  <v-snackbar
    v-model="snackbarStore.show"
    :color="snackbarStore.color"
    :timeout="snackbarStore.timeout"
    location="top"
  >
    {{ snackbarStore.message }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="snackbarStore.show = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useSnackbarStore } from './stores/snackbar'
import { useThemeStore } from './stores/theme'
import { useTheme } from 'vuetify'
import { watch } from 'vue'

const snackbarStore = useSnackbarStore()
const themeStore = useThemeStore()
const theme = useTheme()

// Initialize theme
theme.global.name.value = themeStore.isDark ? 'dark' : 'light'

// Watch for theme changes
watch(() => themeStore.isDark, (val) => {
  theme.global.name.value = val ? 'dark' : 'light'
})
</script>
