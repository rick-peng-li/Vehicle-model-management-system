<template>
  <v-container fluid class="pa-4 pb-16"> <!-- Added pb-16 for bottom nav clearance -->
    <!-- Welcome Header -->
    <div class="mb-4 d-flex justify-space-between align-center">
      <div>
        <div class="text-h6 font-weight-bold">{{ $t('dashboard') }}</div>
        <div class="text-caption text-medium-emphasis">{{ $t('welcomeBack') }}, {{ authStore.user.name }}</div>
      </div>
      <v-avatar color="primary" variant="tonal" rounded="lg">
        <v-img v-if="authStore.user.avatar" :src="authStore.user.avatar"></v-img>
        <v-icon v-else>mdi-account</v-icon>
      </v-avatar>
    </div>

    <!-- Stat Cards (Horizontal Scroll for Mobile) -->
    <div class="d-flex overflow-x-auto pb-2 mb-2" style="gap: 12px; scroll-snap-type: x mandatory;">
      <v-card width="160" class="flex-shrink-0 rounded-lg" elevation="0" border hover style="scroll-snap-align: start;">
        <v-card-text class="pa-3">
          <v-avatar color="primary" variant="tonal" rounded="lg" size="40" class="mb-2">
            <v-icon size="24">mdi-package-variant</v-icon>
          </v-avatar>
          <div class="text-caption text-medium-emphasis">{{ $t('totalProducts') }}</div>
          <div class="text-h6 font-weight-bold">1,234</div>
        </v-card-text>
      </v-card>

      <v-card width="160" class="flex-shrink-0 rounded-lg" elevation="0" border hover style="scroll-snap-align: start;">
        <v-card-text class="pa-3">
          <v-avatar color="success" variant="tonal" rounded="lg" size="40" class="mb-2">
            <v-icon size="24">mdi-car</v-icon>
          </v-avatar>
          <div class="text-caption text-medium-emphasis">{{ $t('totalCars') }}</div>
          <div class="text-h6 font-weight-bold">567</div>
        </v-card-text>
      </v-card>

      <v-card width="160" class="flex-shrink-0 rounded-lg" elevation="0" border hover style="scroll-snap-align: start;">
        <v-card-text class="pa-3">
          <v-avatar color="warning" variant="tonal" rounded="lg" size="40" class="mb-2">
            <v-icon size="24">mdi-alert-circle-outline</v-icon>
          </v-avatar>
          <div class="text-caption text-medium-emphasis">{{ $t('pendingMatches') }}</div>
          <div class="text-h6 font-weight-bold">89</div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Charts Section -->
    <v-card class="rounded-lg mb-4" elevation="0" border hover>
      <div class="d-flex justify-space-between align-center pa-4 pb-0">
        <div class="text-subtitle-1 font-weight-bold">{{ $t('statistics') }}</div>
        <v-btn size="small" variant="text" color="primary">{{ $t('more') }}</v-btn>
      </div>
      <v-card-text class="pa-2">
        <div ref="chart" style="width: 100%; height: 250px;"></div>
      </v-card-text>
    </v-card>

    <!-- Todo List (Mobile List Style) -->
    <div class="text-subtitle-1 font-weight-bold mb-2">{{ $t('todoList') }}</div>
    <v-list class="bg-transparent pa-0" density="comfortable">
      <v-card
        v-for="(item, index) in todos" 
        :key="index"
        class="mb-2 rounded-lg"
        elevation="0"
        border
        hover
        @click="item.done = !item.done"
      >
        <div class="d-flex align-center pa-3">
          <div class="me-3">
             <v-checkbox-btn v-model="item.done" color="primary" density="compact"></v-checkbox-btn>
          </div>
          <div class="flex-grow-1">
            <div :class="{ 'text-decoration-line-through text-medium-emphasis': item.done }" class="font-weight-medium text-body-2">
              {{ $t(item.text) }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              <v-icon size="x-small" class="me-1">mdi-clock-outline</v-icon>
              {{ $t('today10am') }}
            </div>
          </div>
        </div>
      </v-card>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const chart = ref(null)
const todos = ref([
  { text: 'reviewNewProduct', done: false },
  { text: 'approveMatchResult', done: false },
  { text: 'updateSystemSettings', done: true },
])

onMounted(() => {
  if (chart.value) {
    const myChart = echarts.init(chart.value)
    myChart.setOption({
      title: { text: t('monthlyData') },
      tooltip: {},
      xAxis: {
        data: [t('jan'), t('feb'), t('mar'), t('apr'), t('may'), t('jun')]
      },
      yAxis: {},
      series: [
        {
          name: t('sales'),
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }
      ]
    })
    
    window.addEventListener('resize', () => {
      myChart.resize()
    })
  }
})
</script>
