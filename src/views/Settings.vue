<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title>{{ $t('systemSettings') }}</v-card-title>
      <v-list>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon>mdi-theme-light-dark</v-icon>
          </template>
          <v-list-item-title>{{ $t('darkMode') }}</v-list-item-title>
          <template v-slot:append>
             <v-switch v-model="darkMode" hide-details inset></v-switch>
          </template>
        </v-list-item>
        
        <!--
        <v-list-item>
           <template v-slot:prepend>
            <v-icon>mdi-translate</v-icon>
          </template>
          <v-list-item-title>{{ $t('language') }}</v-list-item-title>
          <template v-slot:append>
            <v-btn-toggle v-model="lang" mandatory density="compact">
              <v-btn value="en">EN</v-btn>
              <v-btn value="zh">ZH</v-btn>
            </v-btn-toggle>
          </template>
        </v-list-item>
        -->
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../stores/theme'

const { locale } = useI18n()
const themeStore = useThemeStore()

const darkMode = computed({
  get: () => themeStore.isDark,
  set: (val) => themeStore.setDark(val)
})

const lang = ref(locale.value)

watch(lang, (val) => {
  locale.value = val
})
</script>
