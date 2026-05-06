<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-lg" elevation="0" border>
          <v-card-title class="text-h5">
            {{ $t('themeSettings') }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <!--
              <v-list-subheader>{{ $t('language') }}</v-list-subheader>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-translate</v-icon>
                </template>
                <v-list-item-title>{{ $t('language') }}</v-list-item-title>
                <template v-slot:append>
                  <v-btn-toggle
                    v-model="language"
                    mandatory
                    density="compact"
                    color="primary"
                    variant="outlined"
                  >
                    <v-btn value="zh">中文</v-btn>
                    <v-btn value="en">English</v-btn>
                  </v-btn-toggle>
                </template>
              </v-list-item>

              <v-divider class="my-3"></v-divider>
              -->

              <v-list-subheader>{{ $t('appearance') }}</v-list-subheader>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-theme-light-dark</v-icon>
                </template>
                <v-list-item-title>{{ $t('darkMode') }}</v-list-item-title>
                <template v-slot:append>
                  <v-switch
                    v-model="themeStore.isDark"
                    @update:model-value="(val: boolean | null) => themeStore.setDark(!!val)"
                    hide-details
                    inset
                    color="primary"
                  ></v-switch>
                </template>
              </v-list-item>
              
              <v-divider class="my-3"></v-divider>
              
              <v-list-subheader>{{ $t('primaryColorDemo') }}</v-list-subheader>
              <v-item-group v-model="selectedColor" mandatory class="d-flex flex-wrap gap-4 pa-2">
                <v-item v-for="color in colors" :key="color" :value="color" v-slot="{ isSelected, toggle }">
                  <v-btn
                    :color="color"
                    icon
                    class="ma-1"
                    :variant="isSelected ? 'elevated' : 'text'"
                    @click="toggle"
                  >
                    <v-icon v-if="isSelected">mdi-check</v-icon>
                  </v-btn>
                </v-item>
              </v-item-group>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const selectedColor = ref('primary')

const colors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'purple',
  'indigo',
  'teal',
  'orange'
]
</script>
