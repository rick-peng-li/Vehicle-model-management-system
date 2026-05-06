<template>
  <div class="d-flex flex-column h-100 bg-background overflow-hidden">
    <div class="flex-shrink-0 bg-surface">
      <v-tabs v-model="tab" color="primary" align-tabs="center" bg-color="surface" density="comfortable" class="border-b">
        <v-tab value="rules">{{ $t('autoMatchRules') }}</v-tab>
        <v-tab value="review">
          {{ $t('resultReview') }}
          <v-badge
            v-if="store.pendingMatches.length"
            :content="store.pendingMatches.length"
            color="error"
            inline
            class="ml-2"
          ></v-badge>
        </v-tab>
        <v-tab value="history">{{ $t('history') }}</v-tab>
      </v-tabs>
    </div>

    <div class="flex-grow-1 overflow-hidden" style="position: relative">
      <v-window v-model="tab" class="fill-height">
        <!-- Rules Tab -->
        <v-window-item value="rules" class="fill-height overflow-y-auto">
          <div class="pa-4">
            <v-card class="rounded-lg mb-4" elevation="0" border hover>
              <v-card-title class="text-subtitle-1 font-weight-bold border-b py-3">{{ $t('matchingRulesConfig') }}</v-card-title>
              <v-card-text class="pa-4">
                <v-row dense>
                  <v-col cols="12">
                    <div class="text-caption text-medium-emphasis mb-1">{{ $t('productCategory') }}</div>
                    <v-select
                      v-model="store.rules.categories"
                      :items="['机油', '机滤', '刹车片', '火花塞', '雨刮器']"
                      multiple
                      chips
                      closable-chips
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      class="mb-3"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <div class="text-caption text-medium-emphasis mb-1">{{ $t('carAttributeMatch') }}</div>
                    <v-select
                      v-model="store.rules.attributes"
                      :items="['品牌', '车系', '排量', '年份', '功率']"
                      multiple
                      chips
                      closable-chips
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      class="mb-3"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                     <div class="text-caption text-medium-emphasis mb-1">{{ $t('confidenceThreshold') }} ({{ store.rules.threshold }}%)</div>
                     <v-slider
                      v-model="store.rules.threshold"
                      color="primary"
                      thumb-label
                      step="5"
                      min="0"
                      max="100"
                     ></v-slider>
                  </v-col>
                </v-row>
                
                <div class="d-flex gap-2 mt-4">
                  <v-btn 
                    color="primary" 
                    class="flex-grow-1" 
                    size="large" 
                    elevation="0" 
                    :loading="store.loading"
                    @click="handleSaveRules"
                  >
                    {{ $t('saveRules') }}
                  </v-btn>
                  <v-btn 
                    color="secondary" 
                    variant="tonal" 
                    class="flex-grow-1" 
                    size="large" 
                    elevation="0"
                    :loading="store.loading"
                    @click="handleRunMatch"
                  >
                    {{ $t('runAutoMatch') }}
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
            
            <v-alert
              type="info"
              variant="tonal"
              class="text-caption"
              icon="mdi-information"
              border="start"
            >
              {{ $t('matchingBackgroundRun') }}
            </v-alert>
          </div>
        </v-window-item>

        <!-- Review Tab -->
        <v-window-item value="review" class="fill-height overflow-y-auto">
          <div class="d-flex flex-column min-h-100">
            <div v-if="store.pendingMatches.length === 0" class="d-flex flex-column align-center justify-center fill-height text-medium-emphasis">
              <v-icon size="64" class="mb-4" color="grey-lighten-2">mdi-check-all</v-icon>
              <div>{{ $t('noPendingReviews') }}</div>
              <v-btn class="mt-4" variant="text" color="primary" @click="tab = 'rules'">{{ $t('goToConfigureRules') }}</v-btn>
            </div>
            
            <div v-else class="pa-4 flex-grow-1">
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-subtitle-2 text-medium-emphasis">待审核: {{ store.pendingMatches.length }}</span>
                <v-btn size="small" variant="text" color="primary" @click="handleApproveAll" :loading="store.loading">{{ $t('approveAll') }}</v-btn>
              </div>
              
              <v-card class="rounded-lg border mb-3" v-for="match in store.pendingMatches" :key="match.id" elevation="0" hover>
                <div class="d-flex align-center pa-3 border-b bg-background">
                   <v-icon color="warning" class="me-2" size="small">mdi-alert-circle-outline</v-icon>
                   <span class="font-weight-bold text-caption">匹配ID: {{ match.id }}</span>
                   <v-spacer></v-spacer>
                   <v-chip color="warning" size="x-small" label variant="flat">置信度 {{ match.confidence }}%</v-chip>
                </div>
                <div class="pa-3">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <div class="text-body-2 font-weight-medium">{{ match.productName }}</div>
                    <v-icon size="small" color="grey" class="mx-2">mdi-arrow-right</v-icon>
                    <div class="text-body-2 font-weight-medium">{{ match.carName }}</div>
                  </div>
                  <div class="d-flex gap-2" v-if="authStore.hasPermission('match:edit')">
                    <v-btn 
                      size="small" 
                      color="success" 
                      variant="flat" 
                      class="flex-grow-1" 
                      prepend-icon="mdi-check"
                      @click="handleApprove(match.id)"
                    >
                      {{ $t('pass') }}
                    </v-btn>
                    <v-btn 
                      size="small" 
                      color="error" 
                      variant="tonal" 
                      class="flex-grow-1"
                      prepend-icon="mdi-close"
                      @click="handleReject(match.id)"
                    >
                      {{ $t('reject') }}
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </v-window-item>

        <!-- History Tab -->
        <v-window-item value="history" class="fill-height">
          <div class="d-flex flex-column fill-height position-relative">
             <div class="pa-4 flex-grow-1 overflow-y-auto pb-16">
               <v-card class="rounded-lg mb-3" v-for="item in store.history" :key="item.id" elevation="0" border hover>
                  <div class="pa-3">
                    <div class="d-flex justify-space-between mb-2">
                      <div class="font-weight-bold d-flex align-center">
                        <v-icon size="small" color="primary" class="me-2">mdi-auto-fix</v-icon>
                        {{ item.type }}
                      </div>
                      <div class="text-success font-weight-bold">+{{ item.count }} 条</div>
                    </div>
                    <div class="d-flex justify-space-between text-caption text-medium-emphasis">
                      <div class="d-flex align-center">
                        <v-icon size="x-small" class="me-1">mdi-calendar</v-icon>
                        {{ item.date }}
                      </div>
                      <div class="d-flex align-center">
                        <v-icon size="x-small" class="me-1">mdi-account</v-icon>
                        {{ item.user }}
                      </div>
                      <v-chip size="x-small" :color="item.status === '已完成' ? 'success' : 'warning'" variant="outlined" label>{{ item.status }}</v-chip>
                    </div>
                  </div>
               </v-card>
             </div>
             
             <div class="pa-4 position-absolute bottom-0 w-100 bg-background" style="z-index: 10;">
               <v-btn 
                 block 
                 color="secondary" 
                 prepend-icon="mdi-file-export" 
                 size="large" 
                 elevation="2"
                 @click="handleExport"
               >
                 {{ $t('exportReport') || '导出报表' }}
               </v-btn>
             </div>
          </div>
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMatchingStore } from '../stores/matching'
import { useAuthStore } from '../stores/auth'
import { useSnackbarStore } from '../stores/snackbar'
import { useConfirmStore } from '../stores/confirm'
import { exportToExcel } from '../utils/exportExcel'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const tab = ref('rules')
const store = useMatchingStore()
const authStore = useAuthStore()
const snackbar = useSnackbarStore()
const confirmStore = useConfirmStore()

const handleSaveRules = async () => {
  await store.saveRules(store.rules)
  snackbar.showMessage(t('saveSuccess') || '规则保存成功', 'success')
}

const handleRunMatch = async () => {
  await store.runAutoMatch()
  snackbar.showMessage(t('matchComplete') || '自动匹配完成，请审核结果', 'success')
  tab.value = 'review'
}

const handleApprove = async (id: number) => {
  const confirmed = await confirmStore.confirm(
    t('confirmApproveMatch') || '确认通过此匹配结果？',
    { title: t('review') || '审核' }
  )
  if (confirmed) {
    await store.approveMatch(id)
    snackbar.showMessage(t('approveSuccess') || '已通过', 'success')
  }
}

const handleReject = async (id: number) => {
  const confirmed = await confirmStore.confirm(
    t('confirmRejectMatch') || '确认拒绝此匹配结果？',
    { title: t('review') || '审核', confirmText: '拒绝', cancelText: '取消' }
  )
  if (confirmed) {
    await store.rejectMatch(id)
    snackbar.showMessage(t('rejectSuccess') || '已拒绝', 'info')
  }
}

const handleApproveAll = async () => {
  const confirmed = await confirmStore.confirm(
    t('confirmApproveAll', { count: store.pendingMatches.length }),
    { title: t('batchReview') }
  )
  if (confirmed) {
    await store.approveAll()
    snackbar.showMessage(t('approveAllSuccess'), 'success')
  }
}

const handleExport = async () => {
  const count = store.history.length
  if (count === 0) {
    snackbar.showMessage(t('noDataToExport') || '暂无数据可导出', 'warning')
    return
  }

  const confirmed = await confirmStore.confirm(
    t('confirmExportReport', { count }),
    { title: t('exportReport') || '导出报表' }
  )

  if (!confirmed) return

  const headers = [
    t('id') || 'ID', 
    t('type') || '类型', 
    t('count') || '数量', 
    t('date') || '日期', 
    t('operator') || '操作人', 
    t('status') || '状态'
  ]
  const data = store.history.map(item => [
    item.id,
    item.type,
    item.count,
    item.date,
    item.user,
    item.status
  ])
  
  exportToExcel(`matching-report-${new Date().toISOString().split('T')[0]}.xlsx`, headers, data)
  snackbar.showMessage(t('exportSuccess') || '导出成功', 'success')
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
