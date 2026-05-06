<template>
  <v-container fluid class="pa-4 bg-background">
    <!-- Toolbar -->
    <v-toolbar color="surface" density="compact" class="mb-4 rounded-lg border" style="position: sticky; top: 16px; z-index: 99;">
      <v-text-field
        v-model="search"
        :label="$t('search')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        single-line
        class="ml-2"
        style="max-width: 200px"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" class="mr-2" @click="openDialog()">
        {{ $t('add') }}
      </v-btn>
    </v-toolbar>

    <!-- Content -->
    <v-row>
      <v-col
        v-for="(item, index) in filteredItems"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="h-100 transition-swing rounded-lg" hover border elevation="0">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" class="me-2">
                <span class="text-subtitle-1 font-weight-bold">{{ item.code ? item.code.charAt(0).toUpperCase() : '?' }}</span>
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1 font-weight-bold">
              {{ item.value }}
            </v-card-title>
            <v-card-subtitle>
              {{ item.code }}
            </v-card-subtitle>
            <template v-slot:append>
              <v-chip size="x-small" label color="secondary" variant="flat">
                {{ item.type }}
              </v-chip>
            </template>
          </v-card-item>

          <v-card-text class="text-body-2 text-medium-emphasis pt-2">
            {{ item.description || '-' }}
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-pencil"
              @click="editItem(item)"
            >
              {{ $t('edit') }}
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="error"
              prepend-icon="mdi-delete"
              @click="deleteItem(item)"
            >
              {{ $t('delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Infinite Scroll Trigger -->
    <div v-intersect="onIntersect" class="d-flex justify-center pa-4" v-if="hasMore">
      <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
    </div>
    <div v-else class="text-center text-caption text-medium-emphasis pa-4">
      {{ $t('noMore') }}
    </div>

    <!-- Edit/Add Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="rounded-lg" elevation="0" border>
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon icon="mdi-book-open-page-variant" class="me-2" color="primary"></v-icon>
          <span class="text-h6">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-container class="pa-0">
            <v-row>
              <v-col cols="12">
                <v-text-field 
                  v-model="editedItem.type" 
                  :label="$t('type')" 
                  variant="outlined" 
                  density="comfortable"
                  hide-details="auto"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="editedItem.code" 
                  :label="$t('code')" 
                  variant="outlined" 
                  density="comfortable"
                  hide-details="auto"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="editedItem.value" 
                  :label="$t('value')" 
                  variant="outlined" 
                  density="comfortable"
                  hide-details="auto"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="editedItem.description" 
                  :label="$t('description')" 
                  variant="outlined" 
                  density="comfortable"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" class="px-4" @click="close">{{ $t('cancel') }}</v-btn>
          <v-btn color="primary" variant="elevated" class="px-4" @click="save">{{ $t('save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useConfirmStore } from '../stores/confirm'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const confirmStore = useConfirmStore()

const search = ref('')
const dialog = ref(false)
const editedIndex = ref(-1)
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

const items = ref([
  { type: 'gender', code: 'M', value: t('genderMale'), description: t('descMale') },
  { type: 'gender', code: 'F', value: t('genderFemale'), description: t('descFemale') },
  { type: 'status', code: '1', value: t('statusEnabled'), description: t('descEnabled') },
  { type: 'status', code: '0', value: t('statusDisabled'), description: t('descDisabled') },
])

const editedItem = reactive({
  type: '',
  code: '',
  value: '',
  description: ''
})

const defaultItem = {
  type: '',
  code: '',
  value: '',
  description: ''
}

const filteredItems = computed(() => {
  if (!search.value) return items.value
  const lower = search.value.toLowerCase()
  return items.value.filter(item => 
    item.type.toLowerCase().includes(lower) ||
    item.code.toLowerCase().includes(lower) ||
    item.value.toLowerCase().includes(lower) ||
    item.description.toLowerCase().includes(lower)
  )
})

const formTitle = computed(() => {
  return editedIndex.value === -1 ? t('addDictionaryItem') : t('editDictionaryItem')
})

const openDialog = () => {
  editedIndex.value = -1
  Object.assign(editedItem, defaultItem)
  dialog.value = true
}

const editItem = (item: any) => {
  editedIndex.value = items.value.indexOf(item)
  Object.assign(editedItem, item)
  dialog.value = true
}

const deleteItem = async (item: any) => {
  const confirmed = await confirmStore.confirm(t('deleteDictionaryConfirm'))
  if (confirmed) {
    const index = items.value.indexOf(item)
    items.value.splice(index, 1)
  }
}

const close = () => {
  dialog.value = false
  editedIndex.value = -1
  Object.assign(editedItem, defaultItem)
}

const save = () => {
  if (editedIndex.value > -1) {
    const item = items.value[editedIndex.value]
    if (item) {
      Object.assign(item, editedItem)
    }
  } else {
    items.value.push({ ...editedItem })
  }
  close()
}

const onIntersect = async (isIntersecting: boolean) => {
  if (isIntersecting && hasMore.value && !loading.value) {
    loading.value = true
    // Simulate API call
    setTimeout(() => {
      const newItems = [
        { type: 'color', code: 'R', value: t('colorRed'), description: t('descRed') },
        { type: 'color', code: 'G', value: t('colorGreen'), description: t('descGreen') },
        { type: 'color', code: 'B', value: t('colorBlue'), description: t('descBlue') },
      ]
      
      // Stop adding after 3 pages to simulate end of data
      if (page.value >= 3) {
        hasMore.value = false
      } else {
        items.value.push(...newItems)
        page.value++
      }
      loading.value = false
    }, 1000)
  }
}
</script>
