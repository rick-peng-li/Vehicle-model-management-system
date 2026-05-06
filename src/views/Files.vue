<template>
  <div class="d-flex flex-column h-100 bg-background overflow-hidden">
    <div class="flex-shrink-0 bg-surface">
      <v-tabs v-model="tab" color="primary" align-tabs="start" bg-color="surface" density="comfortable" class="border-b px-4">
        <v-tab value="excel">{{ $t('excelImport') }}</v-tab>
        <v-tab value="images">{{ $t('imageUpload') }}</v-tab>
        <v-tab value="history">{{ $t('importHistory') }}</v-tab>
      </v-tabs>
    </div>

    <div class="flex-grow-1 overflow-hidden">
      <v-window v-model="tab" class="fill-height" :touch="false">
        
        <!-- Excel/Data Import Tab -->
        <v-window-item value="excel" class="fill-height overflow-y-auto">
          <v-container class="pa-4" fluid>
            <!-- Template Download Section -->
            <v-card class="mb-4 rounded-lg" elevation="0" border>
              <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">{{ $t('templateDownload') }}</v-card-title>
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-card variant="outlined" class="d-flex align-center pa-3 rounded-lg hover-card" @click="downloadTemplate('product')">
                      <v-avatar color="green" variant="tonal" class="me-3" rounded>
                        <v-icon color="green" size="large">mdi-file-excel</v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-2 font-weight-bold">{{ $t('productTemplate') }}</div>
                        <div class="text-caption text-medium-emphasis">.xlsx</div>
                      </div>
                      <v-spacer></v-spacer>
                      <v-icon color="grey">mdi-download</v-icon>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-card variant="outlined" class="d-flex align-center pa-3 rounded-lg hover-card" @click="downloadTemplate('car')">
                      <v-avatar color="blue" variant="tonal" class="me-3" rounded>
                        <v-icon color="blue" size="large">mdi-file-excel</v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-2 font-weight-bold">{{ $t('carTemplate') }}</div>
                        <div class="text-caption text-medium-emphasis">.xlsx</div>
                      </div>
                      <v-spacer></v-spacer>
                      <v-icon color="grey">mdi-download</v-icon>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Upload Section -->
            <v-card class="rounded-lg mb-4" elevation="0" border>
              <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">{{ $t('fileUpload') }}</v-card-title>
              <v-card-text class="pa-4">
                <div 
                  class="upload-zone border-dashed rounded-lg pa-8 text-center bg-background cursor-pointer"
                  @click="triggerFileInput('data')"
                  @dragover.prevent
                  @drop.prevent="handleDrop($event, 'data')"
                >
                  <v-icon size="48" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
                  <div class="text-h6 mb-1">{{ $t('dragFilesHere') }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('uploadDataTips') }}</div>
                  <input type="file" ref="dataFileInput" multiple accept=".xlsx,.csv,.zip" class="d-none" @change="handleFileSelect($event, 'data')">
                </div>

                <!-- Active Uploads List -->
                <div v-if="dataUploads.length > 0" class="mt-4">
                  <v-list lines="two" class="bg-transparent">
                    <v-list-item v-for="task in dataUploads" :key="task.id" class="px-0 mb-2 bg-surface rounded border">
                      <template v-slot:prepend>
                        <v-avatar color="grey" variant="tonal" rounded>
                          <v-icon v-if="task.status === 'completed'" color="success">mdi-check-circle</v-icon>
                          <v-icon v-else-if="task.status === 'error'" color="error">mdi-alert-circle</v-icon>
                          <v-icon v-else color="primary">mdi-file-document-outline</v-icon>
                        </v-avatar>
                      </template>
                      
                      <v-list-item-title class="font-weight-medium">
                        {{ task.file.name }}
                        <span class="text-caption text-medium-emphasis ml-2">{{ store.formatSize(task.file.size) }}</span>
                      </v-list-item-title>
                      
                      <v-list-item-subtitle class="mt-2">
                        <div class="d-flex align-center justify-space-between mb-1">
                          <span class="text-caption" :class="getStatusColor(task.status)">
                            {{ getStatusText(task.status) }}
                            <span v-if="task.status === 'uploading'"> - {{ task.speed }} - {{ task.remainingTime }}</span>
                          </span>
                          <span class="text-caption font-weight-bold">{{ task.progress }}%</span>
                        </div>
                        <v-progress-linear
                          :model-value="task.progress"
                          :color="getProgressColor(task.status)"
                          height="6"
                          rounded
                          striped
                          :indeterminate="task.status === 'pending'"
                        ></v-progress-linear>
                        <div v-if="task.errorMessage" class="text-caption text-error mt-1">
                          {{ task.errorMessage }}
                        </div>
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <div class="d-flex align-center">
                          <v-btn v-if="task.status === 'uploading'" icon="mdi-pause" variant="text" size="small" color="grey" @click="store.pauseUpload(task.id)" :title="$t('pause')"></v-btn>
                          <v-btn v-if="task.status === 'paused'" icon="mdi-play" variant="text" size="small" color="primary" @click="store.resumeUpload(task.id)" :title="$t('resume')"></v-btn>
                          <v-btn v-if="task.status === 'error'" icon="mdi-refresh" variant="text" size="small" color="primary" @click="store.retryUpload(task.id)" :title="$t('retry')"></v-btn>
                          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="store.removeTask(task.id)" :title="$t('delete')"></v-btn>
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
              </v-card-text>
            </v-card>
          </v-container>
        </v-window-item>

        <!-- Image Upload Tab -->
        <v-window-item value="images" class="fill-height overflow-y-auto">
          <v-container class="pa-4" fluid>
            <v-card class="rounded-lg mb-4" elevation="0" border>
              <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">{{ $t('imageUpload') }}</v-card-title>
              <v-card-text class="pa-4">
                <div 
                  class="upload-zone border-dashed rounded-lg pa-8 text-center bg-background cursor-pointer"
                  @click="triggerFileInput('image')"
                  @dragover.prevent
                  @drop.prevent="handleDrop($event, 'image')"
                >
                  <v-icon size="48" color="primary" class="mb-2">mdi-image-plus</v-icon>
                  <div class="text-h6 mb-1">{{ $t('dragFilesHere') }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('uploadImageTips') }}</div>
                  <input type="file" ref="imageFileInput" multiple accept=".jpg,.png,.gif,.zip" class="d-none" @change="handleFileSelect($event, 'image')">
                </div>

                <!-- Active Image Uploads List -->
                <div v-if="imageUploads.length > 0" class="mt-4">
                  <v-list lines="two" class="bg-transparent">
                    <v-list-item v-for="task in imageUploads" :key="task.id" class="px-0 mb-2 bg-surface rounded border">
                      <template v-slot:prepend>
                        <v-avatar color="grey" variant="tonal" rounded>
                           <v-img v-if="isImage(task.file)" :src="getObjectUrl(task.file)" cover></v-img>
                           <v-icon v-else color="primary">mdi-folder-zip-outline</v-icon>
                        </v-avatar>
                      </template>
                      
                      <v-list-item-title class="font-weight-medium">
                        {{ task.file.name }}
                        <span class="text-caption text-medium-emphasis ml-2">{{ store.formatSize(task.file.size) }}</span>
                      </v-list-item-title>
                      
                      <v-list-item-subtitle class="mt-2">
                        <div class="d-flex align-center justify-space-between mb-1">
                          <span class="text-caption" :class="getStatusColor(task.status)">
                            {{ getStatusText(task.status) }}
                            <span v-if="task.status === 'uploading'"> - {{ task.speed }} - {{ task.remainingTime }}</span>
                          </span>
                          <span class="text-caption font-weight-bold">{{ task.progress }}%</span>
                        </div>
                        <v-progress-linear
                          :model-value="task.progress"
                          :color="getProgressColor(task.status)"
                          height="6"
                          rounded
                          striped
                          :indeterminate="task.status === 'pending'"
                        ></v-progress-linear>
                         <div v-if="task.errorMessage" class="text-caption text-error mt-1">
                          {{ task.errorMessage }}
                        </div>
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <div class="d-flex align-center">
                          <v-btn v-if="task.status === 'uploading'" icon="mdi-pause" variant="text" size="small" color="grey" @click="store.pauseUpload(task.id)" :title="$t('pause')"></v-btn>
                          <v-btn v-if="task.status === 'paused'" icon="mdi-play" variant="text" size="small" color="primary" @click="store.resumeUpload(task.id)" :title="$t('resume')"></v-btn>
                          <v-btn v-if="task.status === 'error'" icon="mdi-refresh" variant="text" size="small" color="primary" @click="store.retryUpload(task.id)" :title="$t('retry')"></v-btn>
                          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="store.removeTask(task.id)" :title="$t('delete')"></v-btn>
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
              </v-card-text>
            </v-card>
          </v-container>
        </v-window-item>

        <!-- History Tab -->
        <v-window-item value="history" class="fill-height">
          <div class="d-flex flex-column fill-height">
            <div class="flex-grow-1 overflow-y-auto" @scroll="onScroll" style="-webkit-overflow-scrolling: touch;">
              <v-container class="pa-4" fluid>
                <v-card class="rounded-lg" elevation="0" border>
                  <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">{{ $t('importHistory') }}</v-card-title>
                  <v-data-table-server
                    :headers="headers"
                    :items="store.history"
                    :items-length="store.historyTotal"
                    :loading="store.historyLoading"
                    items-per-page="-1"
                    class="bg-transparent history-table"
                    hide-default-footer
                  >
                    <template v-slot:item.fileName="{ item }">
                      <div class="d-flex align-center">
                        <v-icon :color="item.type === 'image' ? 'primary' : 'success'" class="me-2">
                          {{ item.type === 'image' ? 'mdi-image' : 'mdi-file-excel' }}
                        </v-icon>
                        {{ item.fileName }}
                      </div>
                    </template>
                    <template v-slot:item.status="{ item }">
                      <v-chip :color="item.status === 'success' ? 'success' : 'error'" size="small" label>
                        {{ item.status === 'success' ? $t('success') : $t('failed') }}
                      </v-chip>
                    </template>
                    <template v-slot:item.error="{ item }">
                      <v-tooltip location="top" v-if="item.error">
                        <template v-slot:activator="{ props }">
                          <span v-bind="props" class="text-error text-caption cursor-pointer">
                            {{ item.error }}
                          </span>
                        </template>
                        <span>{{ item.error }}</span>
                      </v-tooltip>
                      <span v-else>-</span>
                    </template>
                    
                    <template v-slot:bottom>
                      <div class="text-center py-4" v-if="store.historyLoading">
                        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                        <span class="ms-2 text-caption text-medium-emphasis">{{ $t('loading') }}</span>
                      </div>
                      <div v-else-if="store.history.length >= store.historyTotal && store.history.length > 0" class="text-center py-4 text-caption text-medium-emphasis">
                        {{ $t('noMore') || '没有更多了' }}
                      </div>
                    </template>
                  </v-data-table-server>
                </v-card>
              </v-container>
            </div>
          </div>
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFilesStore } from '../stores/files'
import { useI18n } from 'vue-i18n'
import { exportToExcel } from '../utils/exportExcel'

const { t } = useI18n()
const store = useFilesStore()
const tab = ref('excel')
const dataFileInput = ref<HTMLInputElement | null>(null)
const imageFileInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  store.loadHistory(true)
})

const onScroll = (e: any) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 50 && !store.historyLoading && store.history.length < store.historyTotal) {
    store.loadHistory()
  }
}

const dataUploads = computed(() => store.uploadTasks.filter(t => t.type === 'data'))
const imageUploads = computed(() => store.uploadTasks.filter(t => t.type === 'image'))

const headers = computed(() => [
  { title: t('fileName'), key: 'fileName' },
  { title: t('fileSize'), key: 'fileSize' },
  { title: t('type'), key: 'type' },
  { title: t('date'), key: 'date' },
  { title: t('operator'), key: 'operator' },
  { title: t('status'), key: 'status' },
  { title: t('description'), key: 'error' },
])

const triggerFileInput = (type: 'data' | 'image') => {
  if (type === 'data' && dataFileInput.value) {
    dataFileInput.value.click()
  } else if (type === 'image' && imageFileInput.value) {
    imageFileInput.value.click()
  }
}

const handleFileSelect = (event: Event, type: 'data' | 'image') => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    store.addUploadTask(files, type)
    target.value = '' // Reset input
  }
}

const handleDrop = (event: DragEvent, type: 'data' | 'image') => {
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const files = Array.from(event.dataTransfer.files)
    // Filter by type if strictly needed, but accept attribute handles it mostly for click
    store.addUploadTask(files, type)
  }
}

const downloadTemplate = (type: string) => {
  if (type === 'product') {
    const headers = ['产品名称', '分类', '价格', '库存', '单位', '描述']
    const data = [['示例机油', '保养类', '199.00', '100', '瓶', '全合成机油']]
    exportToExcel('产品导入模板.xlsx', headers, data)
  } else {
    const headers = ['品牌', '车型', '年款', '排量', '指导价']
    const data = [['奥迪', 'A4L', '2024', '2.0T', '32.18']]
    exportToExcel('车型导入模板.xlsx', headers, data)
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-success'
    case 'error': return 'text-error'
    case 'uploading': return 'text-primary'
    case 'paused': return 'text-warning'
    default: return 'text-medium-emphasis'
  }
}

const getProgressColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'error': return 'error'
    case 'paused': return 'warning'
    default: return 'primary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return t('success')
    case 'error': return t('failed')
    case 'uploading': return t('uploading')
    case 'paused': return t('pause')
    case 'pending': return '等待中...'
    default: return status
  }
}

const isImage = (file: File) => {
  return file.type.startsWith('image/')
}

const getObjectUrl = (file: File) => {
  return URL.createObjectURL(file)
}
</script>

<style scoped>
.hover-card {
  transition: all 0.2s;
  cursor: pointer;
}
.hover-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-primary), 0.05);
}
.upload-zone {
  border-width: 2px !important;
  transition: all 0.2s;
}
.upload-zone:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-primary), 0.05) !important;
}

.history-table :deep(th),
.history-table :deep(td) {
  white-space: nowrap !important;
}
</style>
