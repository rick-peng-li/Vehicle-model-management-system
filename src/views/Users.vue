<template>
  <div class="d-flex flex-column fill-height bg-background">
    <!-- Mobile Header -->
    <v-toolbar density="compact" flat color="surface" class="border-b px-2">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        :label="$t('searchUser')"
        variant="outlined"
        density="compact"
        hide-details
        single-line
        class="me-2"
        style="max-width: 300px"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn
        v-if="authStore.hasPermission('user:edit')"
        color="primary"
        prepend-icon="mdi-plus"
        variant="flat"
        @click="openDialog()"
      >
        {{ $t('addUser') }}
      </v-btn>
    </v-toolbar>

    <!-- User List (Mobile Card Style) -->
    <div class="flex-grow-1 overflow-y-auto pa-3">
      <v-data-iterator :items="filteredUsers" :items-per-page="-1">
        <template v-slot:default="{ items }">
          <v-row dense>
            <v-col v-for="item in items" :key="item.raw.email" cols="12" sm="6" md="4">
              <v-card class="rounded-lg mb-2" elevation="0" border hover>
                <div class="pa-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <div class="d-flex align-center">
                      <v-avatar color="primary" variant="tonal" size="32" class="me-2">
                        <span class="font-weight-bold text-caption">{{ item.raw.name.charAt(0) }}</span>
                      </v-avatar>
                      <div class="text-subtitle-2 font-weight-bold">{{ item.raw.name }}</div>
                    </div>
                    <v-chip :color="getRoleColor(item.raw.role)" size="x-small" label variant="flat">
                      {{ $t(item.raw.role) }}
                    </v-chip>
                  </div>
                  
                  <div class="text-caption text-medium-emphasis ps-10 mb-2">
                    {{ item.raw.email }}
                  </div>

                  <div class="d-flex justify-end border-t pt-2 mt-1">
                    <v-btn 
                      v-if="canEdit(item.raw)" 
                      size="small" 
                      variant="text" 
                      color="primary" 
                      class="me-2" 
                      prepend-icon="mdi-pencil" 
                      @click="openDialog(item.raw)"
                    >
                      {{ $t('edit') }}
                    </v-btn>
                    <v-btn 
                      v-if="canDelete(item.raw)" 
                      size="small" 
                      variant="text" 
                      color="error" 
                      prepend-icon="mdi-delete" 
                      @click="deleteItem(item.raw)"
                    >
                      {{ $t('delete') }}
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>
    </div>

    <!-- Dialog for Add/Edit -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="rounded-lg" elevation="0" border>
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon icon="mdi-account" class="me-2" color="primary"></v-icon>
          <span class="text-h6">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-container class="pa-0">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  :label="$t('name')"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.email"
                  :label="$t('email')"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.role"
                  :items="roles"
                  item-title="title"
                  item-value="value"
                  :label="$t('role')"
                  prepend-inner-icon="mdi-shield-account-outline"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            class="px-4"
            @click="close"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="px-4"
            @click="save"
          >
            {{ $t('save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useConfirmStore } from '../stores/confirm'
import { useSnackbarStore } from '../stores/snackbar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const confirmStore = useConfirmStore()
const snackbarStore = useSnackbarStore()

const dialog = ref(false)
const search = ref('')
const editedIndex = ref(-1)
const editedItem = reactive({
  id: '',
  name: '',
  email: '',
  role: 'normalUser'
})
const defaultItem = {
  id: '',
  name: '',
  email: '',
  role: 'normalUser'
}

const roles = computed(() => [
  { title: t('superAdmin'), value: 'superAdmin' },
  { title: t('productManager'), value: 'productManager' },
  { title: t('matchSpecialist'), value: 'matchSpecialist' },
  { title: t('normalUser'), value: 'normalUser' }
])

const users = ref([
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'superAdmin' },
  { id: '2', name: 'Product Mgr', email: 'pm@example.com', role: 'productManager' },
  { id: '3', name: 'Matcher', email: 'match@example.com', role: 'matchSpecialist' },
  { id: '4', name: 'User', email: 'user@example.com', role: 'normalUser' },
])

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const lower = search.value.toLowerCase()
  return users.value.filter(u => 
    u.name.toLowerCase().includes(lower) || 
    u.email.toLowerCase().includes(lower) ||
    u.role.includes(lower)
  )
})

const formTitle = computed(() => {
  return editedIndex.value === -1 ? t('addUser') : t('edit')
})

const getRoleColor = (role: string) => {
  switch (role) {
    case 'superAdmin': return 'red'
    case 'productManager': return 'blue'
    case 'matchSpecialist': return 'green'
    default: return 'grey'
  }
}

// Map internal roles to display names for "Is Self" check
const roleMap: Record<string, string> = {
  'super_admin': 'superAdmin',
  'product_manager': 'productManager',
  'match_specialist': 'matchSpecialist',
  'user': 'normalUser'
}

const canEdit = (item: any) => {
  // Super Admin can edit everyone
  if (authStore.user.role === 'super_admin') return true
  
  // Others can only edit themselves
  // In this mock, we assume "Self" is the user with the matching role
  const currentRoleName = roleMap[authStore.user.role]
  return item.role === currentRoleName
}

const canDelete = (item: any) => {
  // Only Super Admin can delete
  if (authStore.user.role !== 'super_admin') return false
  
  // Super Admin cannot delete self (identified by role 'superAdmin' in this mock)
  if (item.role === 'superAdmin') return false
  
  return true
}

const openDialog = (item?: any) => {
  if (item) {
    editedIndex.value = users.value.indexOf(item)
    Object.assign(editedItem, item)
  } else {
    editedIndex.value = -1
    Object.assign(editedItem, defaultItem)
  }
  dialog.value = true
}

const close = () => {
  dialog.value = false
  setTimeout(() => {
    Object.assign(editedItem, defaultItem)
    editedIndex.value = -1
  }, 300)
}

const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(users.value[editedIndex.value]!, editedItem)
    snackbarStore.showMessage(t('userUpdated'), 'success')
  } else {
    // Generate a simple ID for new users
    const newItem = { ...editedItem, id: Date.now().toString() }
    users.value.push(newItem)
    snackbarStore.showMessage(t('userAdded'), 'success')
  }
  close()
}

const deleteItem = async (item: any) => {
  if (item.role === 'superAdmin') {
    snackbarStore.showMessage(t('superAdminCannotDelete'), 'error')
    return
  }

  const confirmed = await confirmStore.confirm(t('deleteUserConfirm'))
  if (confirmed) {
    const index = users.value.indexOf(item)
    users.value.splice(index, 1)
    snackbarStore.showMessage(t('userDeleted'), 'success')
  }
}
</script>