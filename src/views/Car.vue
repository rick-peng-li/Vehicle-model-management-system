<template>
  <div class="fill-height d-flex flex-column bg-background">


    <!-- Tabs -->
    <div class="bg-surface border-b position-relative" style="z-index: 100;">
      <v-tabs v-model="activeTab" color="primary" align-tabs="center">
        <v-tab value="list" class="text-capitalize">{{ $t('carList') || '车型列表' }}</v-tab>
        <v-tab value="brands" class="text-capitalize">{{ $t('brandManagement') || '品牌管理' }}</v-tab>
        <v-tab value="series" class="text-capitalize">{{ $t('seriesManagement') || '车系管理' }}</v-tab>
        <v-tab value="years" class="text-capitalize">{{ $t('yearManagement') || '年代款管理' }}</v-tab>
      </v-tabs>
    </div>

    <!-- Content -->
    <div class="flex-grow-1 overflow-hidden position-relative">
      <v-window v-model="activeTab" class="fill-height" :touch="false">
        <!-- List Tab -->
        <v-window-item value="list" class="fill-height">
          <div class="d-flex flex-column fill-height bg-surface">
            <!-- Search & Toolbar -->
            <div class="px-4 py-3 border-b flex-shrink-0">
              <div class="d-flex align-center gap-2">
                 <!-- Search Bar with History -->
                 <v-menu v-model="showSearchHistory" :close-on-content-click="false" location="bottom start" offset="5">
                   <template v-slot:activator="{ props }">
                     <v-text-field
                       v-bind="props"
                       v-model="search"
                       :placeholder="$t('searchPlaceholder') || '搜索...'"
                       prepend-inner-icon="mdi-magnify"
                       variant="outlined"
                       density="compact"
                       hide-details
                       rounded="xl"
                       bg-color="background"
                       class="flex-grow-1"
                       clearable
                       @update:model-value="onSearch"
                       @focus="showSearchHistory = true"
                     ></v-text-field>
                   </template>
                   <v-card min-width="300" class="rounded-lg elevation-4" v-if="store.searchHistory.length > 0">
                     <div class="d-flex justify-space-between align-center pa-2 pb-0">
                       <div class="text-caption text-medium-emphasis">{{ $t('searchHistory') || '搜索历史' }}</div>
                       <v-btn icon="mdi-delete" size="x-small" variant="text" color="medium-emphasis" @click="clearHistory"></v-btn>
                     </div>
                     <v-list density="compact">
                       <v-list-item v-for="item in store.searchHistory" :key="item" @click="selectHistory(item)" link>
                         <v-list-item-title>{{ item }}</v-list-item-title>
                         <template v-slot:prepend>
                           <v-icon size="small" class="mr-2">mdi-history</v-icon>
                         </template>
                       </v-list-item>
                     </v-list>
                   </v-card>
                 </v-menu>

                 <!-- Refresh Button -->
                 <v-btn icon="mdi-refresh" variant="text" color="primary" @click="resetPagination" :loading="store.loading"></v-btn>
                 
                 <!-- Column Customization -->
                 <v-menu v-model="columnMenu" :close-on-content-click="false">
                   <template v-slot:activator="{ props }">
                     <v-btn icon="mdi-table-cog" variant="text" color="medium-emphasis" v-bind="props"></v-btn>
                   </template>
                   <v-card min-width="200" class="rounded-lg">
                     <v-card-title class="text-subtitle-2 font-weight-bold">{{ $t('columnSettings') || '列设置' }}</v-card-title>
                     <v-list density="compact">
                      <v-list-item v-for="header in allHeaders.filter(h => h.key !== 'actions')" :key="header.key" :value="header.key" @click="toggleHeader(header.key)">
                        <template v-slot:prepend>
                          <v-checkbox-btn :model-value="selectedHeaders.includes(header.key)" density="compact"></v-checkbox-btn>
                        </template>
                        <v-list-item-title>{{ header.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                   </v-card>
                 </v-menu>
              </div>
            </div>

           <div class="flex-grow-1 overflow-y-auto pb-16" @scroll="onScroll">
               <v-data-table-server
                 v-model="selectedCars"
                 :items-per-page="-1"
                 :items-length="store.total"
                 :headers="visibleHeaders"
                 :items="store.cars"
                :loading="store.loading"
                :row-props="rowProps"
                :bottom-slots="true"
                 show-select
                 hover
                 density="comfortable"
                 @update:sortBy="onSortChange"
               >
                 <template v-slot:bottom>
                   <div class="text-center py-4" v-if="isLoadingMore">
                     <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                     <span class="ms-2 text-caption text-medium-emphasis">{{ $t('loading') }}</span>
                   </div>
                   <div v-else-if="!hasMore && store.cars.length > 0" class="text-center py-4 text-caption text-medium-emphasis">
                     {{ $t('noMore') || '没有更多了' }}
                   </div>
                 </template>
                 <template v-slot:item.brand="{ item }">
                   <div class="font-weight-bold cursor-pointer" @click="openDetails(item)">{{ item.brand }}</div>
                 </template>
                 <template v-slot:item.status="{ item }">
                   <v-chip size="small" :color="item.status === '在售' ? 'success' : 'warning'" label variant="flat">
                     {{ item.status }}
                   </v-chip>
                 </template>
                 <template v-slot:item.actions="{ item }">
                  <div class="d-flex position-relative align-center justify-end" style="min-height: 48px;">
                    <div 
                      class="swipe-action-btn" 
                      @click.stop="openDetails(item)"
                    >
                      <v-icon icon="mdi-file-document-outline" size="small"></v-icon>
                      {{ $t('details') || '详情' }}
                    </div>
                  </div>
                </template>
               </v-data-table-server>
             </div>
           </div>
            
            <!-- Floating Action Button -->
            <v-btn
              v-if="authStore.hasPermission('car:edit')"
              position="fixed"
              location="bottom right"
              icon="mdi-plus"
              color="primary"
              size="x-large"
              elevation="6"
              class="mr-4"
              style="z-index: 100; bottom: 100px;"
              @click="openAdd"
            ></v-btn>
            
            <!-- Export PDF Button -->
            <v-btn
              position="fixed"
              location="bottom left"
              icon="mdi-microsoft-excel"
              color="success"
              size="x-large"
              elevation="6"
              class="ml-4"
              style="z-index: 100; bottom: 100px;"
              @click="exportData"
            ></v-btn>
          </v-window-item>

          <!-- Brand Management Tab -->
          <v-window-item value="brands" class="fill-height">
            <div class="d-flex flex-column fill-height bg-surface">
              <div class="pa-4 text-right">
                <v-btn v-if="authStore.hasPermission('car:edit')" color="primary" prepend-icon="mdi-plus" @click="openSimpleDialog('brand')">{{ $t('add') }}</v-btn>
              </div>
              <v-list>
                <v-list-item v-for="brand in store.brands" :key="brand" :title="brand" prepend-icon="mdi-domain">
                   <template v-slot:append>
                     <v-btn v-if="authStore.hasPermission('car:edit')" icon="mdi-pencil" variant="text" size="small" color="primary" @click="openSimpleDialog('brand', brand)"></v-btn>
                     <v-btn v-if="authStore.hasPermission('car:edit')" icon="mdi-delete" variant="text" size="small" color="error" @click="deleteSimpleItem('brand', brand)"></v-btn>
                   </template>
                </v-list-item>
              </v-list>
              <div v-if="store.brands.length === 0" class="text-center pa-4 text-medium-emphasis">{{ $t('noData') }}</div>
            </div>
          </v-window-item>

          <!-- Series Management Tab -->
          <v-window-item value="series" class="fill-height">
            <div class="d-flex flex-column fill-height bg-surface">
              <div class="pa-4 text-right">
                <v-btn v-if="authStore.hasPermission('car:edit')" color="primary" prepend-icon="mdi-plus" @click="openSimpleDialog('series')">{{ $t('add') }}</v-btn>
              </div>
              <v-list>
                <v-list-item v-for="item in store.series" :key="item" :title="item" prepend-icon="mdi-car-side">
                   <template v-slot:append>
                     <v-btn v-if="authStore.hasPermission('car:edit')" icon="mdi-pencil" variant="text" size="small" color="primary" @click="openSimpleDialog('series', item)"></v-btn>
                     <v-btn v-if="authStore.hasPermission('car:edit')" icon="mdi-delete" variant="text" size="small" color="error" @click="deleteSimpleItem('series', item)"></v-btn>
                   </template>
                </v-list-item>
              </v-list>
              <div v-if="store.series.length === 0" class="text-center pa-4 text-medium-emphasis">{{ $t('noData') }}</div>
            </div>
          </v-window-item>

          <!-- Year Management Tab -->
          <v-window-item value="years" class="fill-height">
            <div class="d-flex flex-column fill-height bg-surface">
             <div class="flex-grow-1 overflow-y-auto" style="-webkit-overflow-scrolling: touch;">
               <div class="pa-4 text-right">
                <v-btn v-if="authStore.hasPermission('car:edit')" color="primary" prepend-icon="mdi-plus" @click="openSimpleDialog('year')">{{ $t('add') }}</v-btn>
              </div>
              <v-list>
                <v-list-item v-for="year in store.years" :key="year" :title="year" prepend-icon="mdi-calendar-range">
                   <template v-slot:append>
                     <v-btn v-if="authStore.hasPermission('car:edit')" icon="mdi-delete" variant="text" size="small" color="error" @click="deleteSimpleItem('year', year)"></v-btn>
                   </template>
                </v-list-item>
              </v-list>
              <div v-if="store.years.length === 0" class="text-center pa-4 text-medium-emphasis">{{ $t('noData') }}</div>
            </div>
            </div>
          </v-window-item>
        </v-window>
      </div>

    <!-- Details Drawer -->
    <v-bottom-sheet
      v-model="detailsDrawer"
      scrim="black"
    >
       <v-card class="d-flex flex-column bg-background rounded-t-xl elevation-10" flat v-if="selectedItem" style="height: 85vh;">
         <div class="d-flex justify-center pt-2 pb-1 bg-surface">
           <div class="bg-surface-variant rounded-pill" style="width: 40px; height: 4px;"></div>
         </div>
         <v-toolbar density="compact" color="surface" flat class="border-b px-2 sticky-top">
            <v-btn icon="mdi-close" variant="text" color="medium-emphasis" @click="detailsDrawer = false"></v-btn>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-center">{{ selectedItem.id ? $t('details') : $t('addVehicle') || '添加车辆' }}</v-toolbar-title>
            <v-btn v-if="authStore.hasPermission('car:edit')" icon="mdi-check" variant="text" color="primary" :loading="store.loading" @click="saveDetails"></v-btn>
         </v-toolbar>
         
         <v-card-text class="flex-grow-1 overflow-y-auto pa-4">
           <v-skeleton-loader v-if="loadingDetails" type="avatar, article, list-item-two-line"></v-skeleton-loader>
           <div v-else>
             <div class="text-center mb-6">
             <v-avatar size="100" color="white" class="mb-3 elevation-2">
               <v-icon size="50" color="primary">mdi-car</v-icon>
             </v-avatar>
             <div class="text-h5 font-weight-bold">{{ selectedItem?.brand }} {{ selectedItem?.model }}</div>
             <v-chip class="mt-2" color="primary" variant="tonal" size="small" v-if="selectedItem?.id">ID: {{ selectedItem?.id }}</v-chip>
           </div>

          <div class="text-subtitle-2 font-weight-bold mb-3 ms-1 text-medium-emphasis">{{ $t('vehicleInfo') }}</div>
          <v-card class="rounded-xl elevation-0 border pa-4 mb-4">
            <v-row dense>
              <v-col cols="6"><v-combobox v-model="selectedItem.brand" :items="store.brands" :label="$t('brand')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-combobox></v-col>
              <v-col cols="6"><v-text-field v-model="selectedItem.model" :label="$t('model')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-text-field></v-col>
              <v-col cols="6"><v-select v-model="selectedItem.type" :items="['燃油', '新能源']" :label="$t('type')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
              <v-col cols="6"><v-select v-model="selectedItem.channel" :items="['国产', '进口']" :label="$t('channel')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
              <v-col cols="6"><v-select v-model="selectedItem.series" :items="store.series" :label="$t('series')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
              <v-col cols="6"><v-combobox v-model="selectedItem.displacement" :items="['1.5L', '2.0L', '2.0T', '3.0T', '4.0T']" :label="$t('engine')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-combobox></v-col>
            </v-row>
          </v-card>
          
          <div class="text-subtitle-2 font-weight-bold mb-3 ms-1 text-medium-emphasis">{{ $t('techSpecs') }}</div>
          <v-card class="rounded-xl elevation-0 border pa-4 mb-4">
            <v-row dense>
              <v-col cols="6"><v-select v-model="selectedItem.powerType" :items="['汽油', '柴油', '混动', '纯电', '插电混动']" :label="$t('powerType')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
              <v-col cols="6"><v-select v-model="selectedItem.transmission" :items="['手动', '自动', '双离合', 'CVT']" :label="$t('transmission')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
              <v-col cols="6"><v-select v-model="selectedItem.driveType" :items="['前驱', '后驱', '四驱']" :label="$t('driveType')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
              <v-col cols="6"><v-select v-model="selectedItem.emission" :items="['国五', '国六a', '国六b', '欧五', '欧六']" :label="$t('emission')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
              <v-col cols="12"><v-select v-model="selectedItem.status" :items="['在售', '停产', '即将上市']" :label="$t('status')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
            </v-row>
          </v-card>

          <div class="text-subtitle-2 font-weight-bold mb-3 ms-1 text-medium-emphasis">{{ $t('productionDate') }}</div>
          <v-card class="rounded-xl elevation-0 border pa-4 mb-16">
            <v-row dense>
              <v-col cols="6"><v-select v-model="selectedItem.year" :items="store.years" :label="$t('year')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select></v-col>
              <v-col cols="6"><v-text-field v-model="selectedItem.productionDate" :label="$t('productionDate')" type="month" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-text-field></v-col>
              <v-col cols="6"><v-text-field v-model="selectedItem.discontinuedDate" :label="$t('discontinuedDate')" type="month" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-text-field></v-col>
            </v-row>
          </v-card>
          </div>
         </v-card-text>
         
         <div class="pa-4 bg-surface border-t position-absolute bottom-0 w-100" style="z-index: 10;" v-if="selectedItem.id && authStore.hasPermission('car:edit')">
           <v-btn block color="error" variant="flat" size="large" class="rounded-xl font-weight-bold" elevation="2" @click="deleteItem" :loading="store.loading">
             <v-icon start>mdi-delete-outline</v-icon>
             {{ $t('deleteVehicle') }}
           </v-btn>
         </div>
       </v-card>
    </v-bottom-sheet>

    <!-- Simple Dialog (Brand/Series/Year) -->
    <v-dialog v-model="simpleDialog" max-width="400">
      <v-card class="rounded-xl">
        <v-card-title class="font-weight-bold">{{ simpleDialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="simpleForm.name"
            :label="$t('name') || '名称'"
            variant="outlined"
            density="comfortable"
            color="primary"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="medium-emphasis" variant="text" @click="simpleDialog = false">{{ $t('cancel') || '取消' }}</v-btn>
          <v-btn color="primary" variant="flat" @click="saveSimpleItem">{{ $t('confirm') || '确定' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCarStore } from '../stores/car'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import { exportToExcel } from '../utils/exportExcel'
import { useSnackbarStore } from '../stores/snackbar'
import { useConfirmStore } from '../stores/confirm'
import { debounce } from 'lodash'

const { t } = useI18n()
const store = useCarStore()
const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()
const confirmStore = useConfirmStore()
const activeTab = ref('list')
const search = ref('')
const showSearchHistory = ref(false)
const columnMenu = ref(false)
const page = ref(1)
const itemsPerPage = ref(20)
const detailsDrawer = ref(false)
const selectedItem = ref<any>(null)
const selectedHeaders = ref(['id', 'brand', 'model', 'year', 'type', 'actions'])
const selectedCars = ref<any[]>([])
const isLoadingMore = ref(false)
const loadingDetails = ref(false)
const detailsCache = new Map<string, any>()
const touchStartX = ref(0)
const touchStartY = ref(0)
const swipedRowId = ref<string | number | null>(null)

const hasMore = computed(() => store.cars.length < store.total)

const rowProps = (data: any) => {
  return {
    class: {
      'swiped-row': swipedRowId.value === data.item.id
    },
    onClick: (e: MouseEvent) => {
      if (swipedRowId.value) {
        swipedRowId.value = null
        return
      }
      // Avoid opening details when clicking checkboxes or other interactive elements that shouldn't trigger it
      const target = e.target as HTMLElement
      if (target.closest('.v-selection-control') || target.closest('.v-btn')) return
      
      openDetails(data.item)
    },
    onTouchstart: (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX.value = e.touches[0]!.clientX
        touchStartY.value = e.touches[0]!.clientY
      }
    },
    onTouchend: (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0]!.clientX
        const touchEndY = e.changedTouches[0]!.clientY
        const diffX = touchStartX.value - touchEndX
        const diffY = touchStartY.value - touchEndY
        
        // Swipe Left (threshold 50px)
        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 50) {
            swipedRowId.value = data.item.id
          } else if (diffX < -50) {
            swipedRowId.value = null
          }
        }
      }
    }
  }
}

const toggleHeader = (key: string) => {
  if (selectedHeaders.value.includes(key)) {
    selectedHeaders.value = selectedHeaders.value.filter(k => k !== key)
  } else {
    selectedHeaders.value.push(key)
  }
}

const allHeaders = computed(() => [
  { title: 'ID', key: 'id', width: '150px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('brand') || '品牌', key: 'brand', minWidth: '120px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('model') || '车型', key: 'model', minWidth: '150px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('type') || '类型', key: 'type', minWidth: '100px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('channel') || '渠道', key: 'channel', minWidth: '100px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('year') || '年份', key: 'year', minWidth: '100px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('powerType') || '动力', key: 'powerType', minWidth: '120px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('status') || '状态', key: 'status', minWidth: '100px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: '', key: 'actions', sortable: false, width: '0px', align: 'end' as const, cellProps: { class: 'pa-0' } },
])

const visibleHeaders = computed(() => {
  return allHeaders.value.filter(h => selectedHeaders.value.includes(h.key))
})

const loadItems = async ({ page: p, itemsPerPage: ipp, append = false }: any) => {
  await store.fetchCars({ page: p, itemsPerPage: ipp, search: search.value, append })
}

const loadMore = async () => {
  if (!hasMore.value || store.loading || isLoadingMore.value) return
  isLoadingMore.value = true
  const nextPage = page.value + 1
  try {
    await loadItems({ page: nextPage, itemsPerPage: itemsPerPage.value, append: true })
    page.value = nextPage
  } finally {
    isLoadingMore.value = false
  }
}

const onScroll = (event: Event) => {
  if (activeTab.value !== 'list') return
  const target = event.target as HTMLElement | null
  if (!target) return
  const threshold = 150
  if (target.scrollTop + target.clientHeight + threshold >= target.scrollHeight) {
    loadMore()
  }
}

const onSortChange = () => {
  resetPagination()
}

const doSearch = () => {
  if (search.value) store.addToHistory(search.value)
  resetPagination()
  showSearchHistory.value = false
}

const onSearch = debounce(doSearch, 500)

const clearHistory = () => {
  store.clearHistory()
  showSearchHistory.value = false
}

const selectHistory = (keyword: string) => {
  search.value = keyword
  doSearch()
}

const resetPagination = () => {
  page.value = 1
  selectedCars.value = []
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
}

const openDetails = (item: any) => {
  detailsDrawer.value = true
  if (detailsCache.has(item.id)) {
    selectedItem.value = { ...detailsCache.get(item.id) }
  } else {
    selectedItem.value = { ...item }
    loadingDetails.value = true
    
    // Simulate fetch
    setTimeout(() => {
      detailsCache.set(item.id, { ...selectedItem.value })
      loadingDetails.value = false
    }, 500)
  }
}

const openAdd = () => {
  selectedItem.value = {
    brand: '',
    model: '',
    type: '燃油',
    channel: '国产',
    year: new Date().getFullYear(),
    productionDate: '',
    discontinuedDate: '',
    powerType: '汽油',
    emission: '国六b',
    series: '轿车',
    displacement: '2.0T',
    transmission: '自动',
    driveType: '前驱',
    status: '在售'
  }
  detailsDrawer.value = true
}

const saveDetails = async () => {
  try {
    if (selectedItem.value.id) {
      await store.updateCar(selectedItem.value)
      detailsCache.set(selectedItem.value.id, { ...selectedItem.value })
    } else {
      await store.addCar(selectedItem.value)
    }
    detailsDrawer.value = false
    loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
    snackbarStore.showMessage(t('success') || '成功', 'success')
  } catch (error) {
    console.error('Failed to save car', error)
    snackbarStore.showMessage(t('saveFailed') || '保存失败', 'error')
  }
}

const deleteItem = async () => {
  if (!await confirmStore.confirm(t('confirmDelete') || '确定要删除吗?', { title: t('delete') || '删除' })) return
  try {
    await store.deleteCar(selectedItem.value.id)
    detailsDrawer.value = false
    loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
    snackbarStore.showMessage(t('success') || '成功', 'success')
  } catch (error) {
    console.error('Failed to delete car', error)
    snackbarStore.showMessage(t('deleteFailed') || '删除失败', 'error')
  }
}

const exportData = () => {
  if (selectedCars.value.length === 0) {
    snackbarStore.showMessage(t('pleaseSelectItems') || '请选择要导出的数据', 'warning')
    return
  }
  const headers = ['ID', t('brand'), t('model'), t('type'), t('channel'), t('year'), t('powerType'), t('status')]
  const data = selectedCars.value.map(p => [
    p.id, 
    p.brand, 
    p.model, 
    p.type || '-',
    p.channel || '-',
    p.year, 
    p.powerType || '-',
    p.status
  ])
  
  exportToExcel('cars.xlsx', headers, data)
}

// Simple Dialog Logic
const simpleDialogTitle = computed(() => {
  const action = simpleForm.value.oldName ? t('edit') : t('add')
  const typeMap: Record<string, string> = {
    'brand': t('brand'),
    'series': t('series'),
    'year': t('year')
  }
  return `${action} ${typeMap[simpleDialogType.value] || ''}`
})

const simpleDialog = ref(false)
const simpleDialogType = ref('')
const simpleForm = ref({ name: '', oldName: '' })

const openSimpleDialog = (type: string, item?: string) => {
  simpleDialogType.value = type
  simpleForm.value = { 
    name: item || '', 
    oldName: item || '' 
  }
  simpleDialog.value = true
}

const saveSimpleItem = async () => {
  try {
    const { name, oldName } = simpleForm.value
    if (!name) return

    if (simpleDialogType.value === 'brand') {
      if (oldName) await store.updateBrand(oldName, name)
      else await store.addBrand(name)
    } else if (simpleDialogType.value === 'series') {
      if (oldName) await store.updateSeries(oldName, name)
      else await store.addSeries(name)
    } else if (simpleDialogType.value === 'year') {
      // Years usually don't need update, just add/delete, but let's support add
      await store.addYear(name)
    }
    
    simpleDialog.value = false
    snackbarStore.showMessage(t('success') || '成功', 'success')
    // Refresh data
    if (simpleDialogType.value === 'brand') await store.fetchBrands()
    else if (simpleDialogType.value === 'series') await store.fetchSeries()
    else if (simpleDialogType.value === 'year') await store.fetchYears()
  } catch (error) {
    snackbarStore.showMessage(t('saveFailed') || '保存失败', 'error')
  }
}

const deleteSimpleItem = async (type: string, name: string) => {
  if (!await confirmStore.confirm(t('confirmDelete') || '确定要删除吗?', { title: t('delete') || '删除' })) return
  try {
    if (type === 'brand') await store.deleteBrand(name)
    else if (type === 'series') await store.deleteSeries(name)
    else if (type === 'year') await store.deleteYear(name)
    
    snackbarStore.showMessage(t('success') || '成功', 'success')
    // Refresh data
    if (type === 'brand') await store.fetchBrands()
    else if (type === 'series') await store.fetchSeries()
    else if (type === 'year') await store.fetchYears()
  } catch (error) {
    snackbarStore.showMessage(t('deleteFailed') || '删除失败', 'error')
  }
}

onMounted(() => {
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
  store.fetchBrands()
  store.fetchSeries()
  store.fetchYears()
})
</script>

<style scoped>
/* Compact Pagination */
:deep(.v-pagination__list) {
  justify-content: center;
}
:deep(.v-pagination__item) {
  margin: 0 2px !important;
}
:deep(.v-pagination__next), :deep(.v-pagination__prev) {
  margin: 0 2px !important;
}

:deep(tr.swiped-row td) {
  transform: translateX(-60px);
}

:deep(td) {
  transition: transform 0.3s ease;
  position: relative;
  background-color: rgb(var(--v-theme-surface)); /* Ensure content covers anything behind */
}

.swipe-action-btn {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 60px;
  height: 48px; /* Approximate row height */
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  pointer-events: auto;
  z-index: 1;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  font-weight: bold;
  line-height: 1.2;
}

:deep(tr.swiped-row) .swipe-action-btn {
  opacity: 1;
  visibility: visible;
}

:deep(tr.swiped-row) .swipe-action-btn {
  opacity: 1;
}

:deep(.v-data-table-header__content) {
  white-space: nowrap;
}
</style>
