<template>
  <div class="fill-height position-relative">
    <div class="d-flex flex-column fill-height bg-background">
      <!-- Tabs -->
      <div class="bg-surface border-b position-relative" style="z-index: 100;">
        <v-tabs
          v-model="activeTab"
          color="primary"
          align-tabs="center"
        >
          <v-tab value="list">{{ $t('productList') || '产品列表' }}</v-tab>
          <v-tab value="categories">{{ $t('categoryManagement') || '产品分类管理' }}</v-tab>
          <v-tab value="inventory">{{ $t('inventoryManagement') || '库存管理' }}</v-tab>
          <v-tab value="price">{{ $t('priceManagement') || '价格管理' }}</v-tab>
        </v-tabs>
      </div>

      <!-- Tab Content -->
      <div class="flex-grow-1 overflow-hidden d-flex flex-column" style="height: 100%;">
        <v-window v-model="activeTab" class="fill-height" style="height: 100%;" :touch="false">
          <!-- Product List Tab -->
          <v-window-item value="list" class="fill-height">
            <div class="d-flex flex-column fill-height bg-surface">
              <!-- Search & Toolbar -->
              <div class="px-4 py-3 border-b flex-shrink-0">
                <div class="d-flex align-center gap-2 mb-2">
                   <!-- Search Bar with History -->
                   <v-menu v-model="showSearchHistory" :close-on-content-click="false" location="bottom start" offset="5">
                     <template v-slot:activator="{ props }">
                       <v-text-field
                         v-bind="props"
                         v-model="search"
                         :placeholder="$t('search') || '搜索'"
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
                         <div class="text-caption text-medium-emphasis">{{ $t('recentSearch') || '最近搜索' }}</div>
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
                       <v-card-title class="text-subtitle-2 font-weight-bold">{{ $t('columns') || '列设置' }}</v-card-title>
                       <v-list density="compact">
                        <v-list-item v-for="header in customizableHeaders" :key="header.key" @click="toggleHeader(header.key)">
                          <template v-slot:prepend>
                            <v-checkbox-btn :model-value="selectedHeaders.includes(header.key)" density="compact"></v-checkbox-btn>
                          </template>
                          <v-list-item-title>{{ header.title }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                     </v-card>
                   </v-menu>
                </div>
                
                <!-- Filters -->
                <div class="d-flex align-center">
                   <v-tabs v-model="selectedCategory" show-arrows density="compact" color="primary" class="flex-grow-1">
                     <v-tab value="">{{ $t('all') }}</v-tab>
                     <v-tab v-for="cat in store.categories" :key="cat.id" :value="cat.name">{{ cat.name }}</v-tab>
                   </v-tabs>
                </div>
              </div>

              <!-- Table -->
             <div class="flex-grow-1 overflow-y-auto pb-16" @scroll="onScroll">
               <v-data-table-server
                 v-model="selectedProducts"
                 :items-per-page="-1"
                 :items-length="store.total"
                 :headers="visibleHeaders"
                 :items="store.products"
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
                   <div v-else-if="!hasMore && store.products.length > 0" class="text-center py-4 text-caption text-medium-emphasis">
                     {{ $t('noMore') || '没有更多了' }}
                   </div>
                 </template>
                 <template v-slot:item.name="{ item }">
                   <div class="font-weight-bold text-truncate cursor-pointer" @click="openDetails(item)">{{ item.name }}</div>
                 </template>
                 <template v-slot:item.price="{ item }">
                   <div class="text-error font-weight-bold">¥{{ item.price }}</div>
                 </template>
                 <template v-slot:item.stock="{ item }">
                   <div :class="item.stock < 10 ? 'text-error font-weight-bold' : ''">{{ item.stock }}</div>
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
          </v-window-item>

          <!-- Category Management Tab -->
          <v-window-item value="categories" class="fill-height">
            <div class="d-flex flex-column fill-height">
             <div class="flex-grow-1 overflow-y-auto bg-surface" style="-webkit-overflow-scrolling: touch;">
               <div class="pa-4 text-right">
                  <v-btn v-if="authStore.hasPermission('product:edit')" color="primary" prepend-icon="mdi-plus" @click="openCategoryDialog()">{{ $t('addCategory') }}</v-btn>
               </div>
               <v-list open-strategy="multiple">
                 <v-list-group v-for="category in store.categories" :key="category.id" :value="category.name">
                   <template v-slot:activator="{ props }">
                     <v-list-item v-bind="props" prepend-icon="mdi-folder" :title="category.name">
                        <template v-slot:append>
                          <v-btn v-if="authStore.hasPermission('product:edit')" icon="mdi-pencil" variant="text" size="small" color="primary" @click.stop="openCategoryDialog(category)"></v-btn>
                          <v-btn v-if="authStore.hasPermission('product:edit')" icon="mdi-plus" variant="text" size="small" color="success" @click.stop="openCategoryDialog(null, category)"></v-btn>
                          <v-btn v-if="authStore.hasPermission('product:edit')" icon="mdi-delete" variant="text" size="small" color="error" @click.stop="deleteCategory(category)"></v-btn>
                        </template>
                     </v-list-item>
                   </template>
                   <v-list-item
                     v-for="child in category.children"
                     :key="child.id"
                     :title="child.name"
                     prepend-icon="mdi-file-outline"
                     :value="child.name"
                   >
                     <template v-slot:append>
                       <v-btn v-if="authStore.hasPermission('product:edit')" icon="mdi-pencil" variant="text" size="small" color="primary" @click.stop="openCategoryDialog(child)"></v-btn>
                       <v-btn v-if="authStore.hasPermission('product:edit')" icon="mdi-delete" variant="text" size="small" color="error" @click.stop="deleteCategory(child)"></v-btn>
                     </template>
                   </v-list-item>
                 </v-list-group>
               </v-list>
               <div class="pa-4 text-center" v-if="store.categories.length === 0">
                 <v-btn color="primary" @click="store.fetchCategories">{{ $t('loadCategories') }}</v-btn>
               </div>
             </div>
            </div>
          </v-window-item>

          <!-- Inventory Management Tab -->
          <v-window-item value="inventory" class="fill-height">
            <div class="d-flex flex-column fill-height">
             <div
               class="flex-grow-1 overflow-y-auto"
               style="-webkit-overflow-scrolling: touch;"
               @scroll="onScroll"
             >
               <v-table class="sticky-header-table">
                 <thead>
                   <tr>
                     <th class="text-left">ID</th>
                     <th class="text-left">{{ $t('name') }}</th>
                     <th class="text-left">{{ $t('currentStock') }}</th>
                     <th class="text-left">{{ $t('status') }}</th>
                     <th class="text-left">{{ $t('actions') }}</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr v-for="item in store.products" :key="item.id">
                     <td>{{ item.id }}</td>
                     <td>{{ item.name }}</td>
                     <td :class="item.stock < 10 ? 'text-error font-weight-bold' : ''">{{ item.stock }}</td>
                     <td>
                       <v-chip :color="item.stock > 10 ? 'success' : 'warning'" size="small">
                         {{ item.stock > 10 ? $t('stockSufficient') : $t('stockInsufficient') }}
                       </v-chip>
                     </td>
                     <td>
                       <v-btn v-if="authStore.hasPermission('product:edit')" size="small" variant="text" color="primary" @click="openStockDialog(item)">{{ $t('adjust') }}</v-btn>
                     </td>
                   </tr>
                 </tbody>
               </v-table>
               
              <!-- Infinite Scroll Status -->
              <div class="text-center py-4" v-if="isLoadingMore">
                <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                <span class="ms-2 text-caption text-medium-emphasis">{{ $t('loading') }}</span>
              </div>
              <div v-else-if="!hasMore && store.products.length > 0" class="text-center py-4 text-caption text-medium-emphasis">
                {{ $t('noMore') || '没有更多了' }}
              </div>
             </div>
            </div>
          </v-window-item>

          <!-- Price Management Tab -->
          <v-window-item value="price" class="fill-height">
            <div class="d-flex flex-column fill-height">
             <div
               class="flex-grow-1 overflow-y-auto"
               style="-webkit-overflow-scrolling: touch;"
               @scroll="onScroll"
             >
               <v-table class="sticky-header-table">
                 <thead>
                   <tr>
                     <th class="text-left">ID</th>
                     <th class="text-left">{{ $t('name') }}</th>
                     <th class="text-left">{{ $t('retailPrice') }}</th>
                     <th class="text-left">{{ $t('wholesalePrice') }} ({{ $t('estimated') }})</th>
                     <th class="text-left">{{ $t('actions') }}</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr v-for="item in store.products" :key="item.id">
                     <td>{{ item.id }}</td>
                     <td>{{ item.name }}</td>
                     <td class="text-primary font-weight-bold">¥{{ item.price }}</td>
                     <td class="text-medium-emphasis">¥{{ (item.price * 0.8).toFixed(2) }}</td>
                     <td>
                       <v-btn v-if="authStore.hasPermission('product:edit')" size="small" variant="text" color="primary" @click="openPriceDialog(item)">{{ $t('edit') }}</v-btn>
                     </td>
                   </tr>
                 </tbody>
               </v-table>
               
              <!-- Infinite Scroll Status -->
              <div class="text-center py-4" v-if="isLoadingMore">
                <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                <span class="ms-2 text-caption text-medium-emphasis">{{ $t('loading') }}</span>
              </div>
              <div v-else-if="!hasMore && store.products.length > 0" class="text-center py-4 text-caption text-medium-emphasis">
                {{ $t('noMore') || '没有更多了' }}
              </div>
             </div>
            </div>
          </v-window-item>
        </v-window>
      </div>

    </div>

    <!-- Category Dialog -->
    <v-dialog v-model="categoryDialog" max-width="500">
      <v-card class="rounded-xl">
        <v-card-title class="text-h6 font-weight-bold pa-4">{{ categoryForm.id ? $t('editCategory') : $t('addCategory') }}</v-card-title>
        <v-card-text class="pa-4">
          <div v-if="parentCategoryName" class="mb-2 text-subtitle-2 text-medium-emphasis">
            {{ $t('parentCategory') || '父分类' }}: {{ parentCategoryName }}
          </div>
          <v-text-field v-model="categoryForm.name" :label="$t('categoryName')" variant="outlined" density="comfortable" color="primary"></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="categoryDialog = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="saveCategory">{{ $t('save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Stock Dialog -->
    <v-dialog v-model="stockDialog" max-width="500">
      <v-card class="rounded-xl">
        <v-card-title class="text-h6 font-weight-bold pa-4">{{ $t('adjustStock') }}</v-card-title>
        <v-card-text class="pa-4">
          <div class="mb-2 text-subtitle-1">{{ selectedStockItem?.name }}</div>
          <div class="d-flex align-center">
             <v-btn icon="mdi-minus" variant="tonal" density="comfortable" @click="adjustStockValue(-1)"></v-btn>
             <v-text-field v-model.number="stockAdjustment" type="number" variant="outlined" density="compact" hide-details class="mx-4 centered-input" style="max-width: 100px; text-align: center;"></v-text-field>
             <v-btn icon="mdi-plus" variant="tonal" density="comfortable" @click="adjustStockValue(1)"></v-btn>
          </div>
          <div class="mt-4 text-caption text-medium-emphasis">
            {{ $t('current') }}: {{ selectedStockItem?.stock }} -> {{ $t('afterAdjustment') }}: {{ (selectedStockItem?.stock || 0) + stockAdjustment }}
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="stockDialog = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="saveStock">{{ $t('confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Price Dialog -->
    <v-dialog v-model="priceDialog" max-width="500">
      <v-card class="rounded-xl">
        <v-card-title class="text-h6 font-weight-bold pa-4">{{ $t('editPrice') }}</v-card-title>
        <v-card-text class="pa-4">
          <div class="mb-4 text-subtitle-1">{{ selectedPriceItem?.name }}</div>
          <v-text-field v-model.number="newPrice" :label="$t('retailPrice')" prefix="¥" type="number" variant="outlined" density="comfortable" color="primary"></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="priceDialog = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="savePrice">{{ $t('save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-center">{{ selectedItem.id ? $t('details') : $t('addProduct') }}</v-toolbar-title>
            <v-btn icon="mdi-check" variant="text" color="primary" font-weight="bold" @click="saveDetails" :loading="store.loading"></v-btn>
         </v-toolbar>
         
         <v-card-text class="flex-grow-1 overflow-y-auto pa-4">
           <v-img
             v-if="selectedItem.image"
             :src="selectedItem.image"
             cover
             height="200"
             class="mb-4 rounded-lg"
             loading="lazy"
             bg-color="surface-variant"
           ></v-img>

           <v-skeleton-loader v-if="loadingDetails" type="article, list-item-two-line"></v-skeleton-loader>
           <div v-else>
             <v-card class="rounded-xl elevation-0 border mb-4 overflow-hidden">
            <div class="pa-4">
              <div class="text-h6 font-weight-bold mb-1">{{ selectedItem.name || $t('newProduct') }}</div>
              <div class="d-flex align-center justify-space-between">
                <div class="text-h5 font-weight-bold text-error">¥{{ selectedItem.price || 0 }}</div>
                <v-chip color="primary" variant="flat" size="small" v-if="selectedItem.category">{{ selectedItem.category }}</v-chip>
              </div>
            </div>
          </v-card>
           
           <div class="text-subtitle-2 font-weight-bold mb-3 ms-1 text-medium-emphasis">{{ $t('basicInfo') }}</div>
           <v-card class="rounded-xl elevation-0 border pa-4 mb-4">
             <v-text-field v-model="selectedItem.name" :label="$t('name')" variant="outlined" density="comfortable" color="primary" class="mb-3" bg-color="surface"></v-text-field>
             <v-select v-model="selectedItem.category" :items="categories" :label="$t('category')" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-select>
           </v-card>
           
           <div class="text-subtitle-2 font-weight-bold mb-3 ms-1 text-medium-emphasis">{{ $t('stockAndPrice') }}</div>
           <v-card class="rounded-xl elevation-0 border pa-4 mb-4">
             <v-row>
               <v-col cols="6">
                 <v-text-field v-model="selectedItem.price" :label="$t('price')" type="number" variant="outlined" density="comfortable" prefix="¥" color="primary" bg-color="surface"></v-text-field>
               </v-col>
               <v-col cols="6">
                 <v-text-field v-model="selectedItem.stock" :label="$t('stock')" type="number" variant="outlined" density="comfortable" color="primary" bg-color="surface"></v-text-field>
               </v-col>
             </v-row>
           </v-card>
           
           <div class="text-subtitle-2 font-weight-bold mb-3 ms-1 text-medium-emphasis">{{ $t('description') }}</div>
           <v-card class="rounded-xl elevation-0 border pa-4 mb-16">
             <v-textarea v-model="selectedItem.description" :label="$t('description')" variant="outlined" density="comfortable" rows="3" auto-grow color="primary" bg-color="surface"></v-textarea>
           </v-card>
           </div>
         </v-card-text>
         
         <div class="pa-4 bg-surface border-t position-absolute bottom-0 w-100" style="z-index: 10;" v-if="selectedItem.id">
           <v-btn block color="error" variant="flat" size="large" class="rounded-xl font-weight-bold" elevation="2" @click="deleteItem" :loading="store.loading">
             <v-icon start>mdi-delete-outline</v-icon>
             {{ $t('deleteProduct') }}
           </v-btn>
         </div>
       </v-card>
    </v-bottom-sheet>
    
    <!-- Floating Action Button -->
    <v-btn
      v-if="activeTab === 'list' && authStore.hasPermission('product:edit')"
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
    <v-btn
      v-if="activeTab === 'list'"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProductStore } from '../stores/product'
import { useAuthStore } from '../stores/auth'
import { useSnackbarStore } from '../stores/snackbar'
import { useConfirmStore } from '../stores/confirm'
import { exportToExcel } from '../utils/exportExcel'
import { useI18n } from 'vue-i18n'
import { debounce } from 'lodash'

const { t } = useI18n()
const store = useProductStore()
const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()
const confirmStore = useConfirmStore()
const search = ref('')
const showSearchHistory = ref(false)
const columnMenu = ref(false)
const page = ref(1)
const activeTab = ref('list')
const selectedCategory = ref('')
const itemsPerPage = ref(20)
const detailsDrawer = ref(false)
const selectedItem = ref<any>(null)
const selectedHeaders = ref(['id', 'name', 'category', 'price', 'image', 'actions'])
const isLoadingMore = ref(false)
const loadingDetails = ref(false)
const detailsCache = new Map<string, any>()
const touchStartX = ref(0)
const touchStartY = ref(0)
const swipedRowId = ref<string | number | null>(null)

const hasMore = computed(() => store.products.length < store.total)
const selectedProducts = ref<any[]>([])

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

const resetPagination = () => {
  page.value = 1
  selectedProducts.value = [] // Clear selection on reset
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
}

// Watch for category change
watch(selectedCategory, () => {
  resetPagination()
})

// Watch for tab change
watch(activeTab, (newTab) => {
  if (newTab === 'categories') {
    store.fetchCategories()
  } else {
    // Refresh products when switching to list, inventory, or price
    if (store.products.length === 0) {
      resetPagination()
    }
  }
})

// Category Management
const categoryDialog = ref(false)
const categoryForm = ref({ id: 0, name: '', parentId: 0 })
const parentCategoryName = ref('')

const openCategoryDialog = (category?: any, parentOrId?: any) => {
  parentCategoryName.value = ''
  if (category) {
    categoryForm.value = { id: category.id, name: category.name, parentId: 0 }
  } else {
    if (typeof parentOrId === 'object' && parentOrId !== null) {
      categoryForm.value = { id: 0, name: '', parentId: parentOrId.id }
      parentCategoryName.value = parentOrId.name
    } else {
      categoryForm.value = { id: 0, name: '', parentId: typeof parentOrId === 'number' ? parentOrId : 0 }
    }
  }
  categoryDialog.value = true
}

const saveCategory = async () => {
  try {
    if (categoryForm.value.id) {
      await store.updateCategory(categoryForm.value.id, categoryForm.value.name)
    } else {
      await store.addCategory(categoryForm.value.name, categoryForm.value.parentId)
    }
    categoryDialog.value = false
    snackbarStore.showMessage(t('success') || '成功', 'success')
  } catch (e) {
    console.error(e)
    snackbarStore.showMessage(t('saveFailed') || '保存失败', 'error')
  }
}

const deleteCategory = async (category: any) => {
  if (!await confirmStore.confirm(t('deleteCategoryConfirm', { name: category.name }), { title: t('confirmDelete') || '确认删除' })) return
  try {
    await store.deleteCategory(category.id)
    snackbarStore.showMessage(t('success') || '成功', 'success')
  } catch (e: any) {
    console.error(e)
    const msg = e.response?.data?.message || t('deleteFailed') || '删除失败'
    snackbarStore.showMessage(msg, 'error')
  }
}

// Stock Management
const stockDialog = ref(false)
const selectedStockItem = ref<any>(null)
const stockAdjustment = ref(0)

const openStockDialog = (item: any) => {
  selectedStockItem.value = item
  stockAdjustment.value = 0
  stockDialog.value = true
}

const adjustStockValue = (delta: number) => {
  stockAdjustment.value += delta
}

const saveStock = async () => {
  if (selectedStockItem.value) {
    try {
      const newStock = Math.max(0, (selectedStockItem.value.stock || 0) + stockAdjustment.value)
      await store.updateProduct({ ...selectedStockItem.value, stock: newStock })
      stockDialog.value = false
      resetPagination()
      snackbarStore.showMessage(t('success') || '成功', 'success')
    } catch (e) {
      console.error(e)
      snackbarStore.showMessage(t('saveFailed') || '保存失败', 'error')
    }
  }
}

// Price Management
const priceDialog = ref(false)
const selectedPriceItem = ref<any>(null)
const newPrice = ref(0)

const openPriceDialog = (item: any) => {
  selectedPriceItem.value = item
  newPrice.value = item.price
  priceDialog.value = true
}

const savePrice = async () => {
  if (selectedPriceItem.value) {
    try {
      await store.updateProduct({ ...selectedPriceItem.value, price: newPrice.value })
      priceDialog.value = false
      resetPagination()
      snackbarStore.showMessage(t('success') || '成功', 'success')
    } catch (e) {
      console.error(e)
      snackbarStore.showMessage(t('saveFailed') || '保存失败', 'error')
    }
  }
}

const categories = computed(() => {
  const flat: string[] = []
  store.categories.forEach((cat: any) => {
    if (cat.children) {
      cat.children.forEach((child: any) => flat.push(child.name))
    } else {
      flat.push(cat.name)
    }
  })
  return flat.length > 0 ? flat : []
})

onMounted(() => {
  resetPagination()
  store.fetchCategories()
})

const allHeaders = computed(() => [
  { title: 'ID', key: 'id', width: '150px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('name') || '名称', key: 'name', minWidth: '180px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('category') || '分类', key: 'category', minWidth: '120px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('price') || '价格', key: 'price', minWidth: '120px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: t('stock') || '库存', key: 'stock', minWidth: '120px', align: 'start' as const, cellProps: { style: 'white-space: nowrap' } },
  { title: '', key: 'actions', sortable: false, width: '0px', align: 'end' as const, cellProps: { class: 'pa-0' } },
])

const customizableHeaders = computed(() => {
  return allHeaders.value.filter(h => h.key !== 'actions')
})

const visibleHeaders = computed(() => {
  return allHeaders.value.filter(h => selectedHeaders.value.includes(h.key))
})

const onSortChange = () => {
  resetPagination()
}

const loadItems = async ({ page, itemsPerPage, append = false }: any) => {
  await store.fetchProducts({ page, itemsPerPage, search: search.value, category: selectedCategory.value, append })
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
  const target = event.target as HTMLElement | null
  if (!target) return
  const threshold = 150
  if (target.scrollTop + target.clientHeight + threshold >= target.scrollHeight) {
    loadMore()
  }
}

const onSearch = debounce(() => {
  if (search.value) {
    store.addToHistory(search.value)
    showSearchHistory.value = false
  }
  resetPagination()
}, 500)

const selectHistory = (keyword: string) => {
  search.value = keyword
  onSearch()
}

const clearHistory = () => {
  store.clearHistory()
}

const openDetails = (item: any) => {
  detailsDrawer.value = true
  
  if (detailsCache.has(item.id)) {
    selectedItem.value = { ...detailsCache.get(item.id) }
  } else {
    selectedItem.value = { ...item }
    loadingDetails.value = true
    
    // Simulate fetch and cache
    setTimeout(() => {
      if (!selectedItem.value.image) {
        selectedItem.value.image = 'https://picsum.photos/400/300?random=' + item.id
      }
      detailsCache.set(item.id, { ...selectedItem.value })
      loadingDetails.value = false
    }, 500)
  }
}

const openAdd = () => {
  selectedItem.value = {
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: ''
  }
  detailsDrawer.value = true
}

const saveDetails = async () => {
  try {
    if (selectedItem.value.id) {
      await store.updateProduct(selectedItem.value)
      detailsCache.set(selectedItem.value.id, { ...selectedItem.value })
    } else {
      await store.addProduct(selectedItem.value)
    }
    detailsDrawer.value = false
    resetPagination()
  } catch (error) {
    console.error('Failed to save product', error)
  }
}

const deleteItem = async () => {
  if (!await confirmStore.confirm(t('confirmDelete') || '确定要删除吗?', { title: t('delete') || '删除' })) return
  try {
    await store.deleteProduct(selectedItem.value.id)
    detailsDrawer.value = false
    resetPagination()
    snackbarStore.showMessage(t('success') || '成功', 'success')
  } catch (error) {
    console.error('Failed to delete product', error)
    snackbarStore.showMessage(t('deleteFailed') || '删除失败', 'error')
  }
}

const exportData = () => {
  if (selectedProducts.value.length === 0) {
    snackbarStore.showMessage(t('pleaseSelectProducts') || '请选择要导出的产品', 'warning')
    return
  }
  
  const headers = customizableHeaders.value.map(h => h.title || '')
  const data = selectedProducts.value.map(item => {
    return customizableHeaders.value.map(h => item[h.key])
  })
  
  exportToExcel('products.xlsx', headers, data)
}
</script>

<style scoped>
.search-bar :deep(.v-field__outline__start) {
  border-radius: 24px 0 0 24px !important;
}
.search-bar :deep(.v-field__outline__end) {
  border-radius: 0 24px 24px 0 !important;
}
/* Sticky Header Style */
.sticky-header-table :deep(th) {
  position: sticky !important;
  top: 0 !important;
  z-index: 2 !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  box-shadow: 0 1px 0 rgba(0,0,0,0.12);
}

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
