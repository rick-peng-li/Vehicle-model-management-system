<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <!-- User Info -->
      <v-list-item
        :prepend-avatar="authStore.user.avatar"
        :title="authStore.user.name"
        :subtitle="authStore.user.department"
      >
        <template v-slot:append>
           <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-account-convert" variant="text" size="small" v-bind="props" title="Switch Role"></v-btn>
            </template>
            <v-list density="compact">
              <v-list-subheader>{{ $t('switchRole') }}</v-list-subheader>
              <v-list-item value="super_admin" @click="switchRole('super_admin')">
                <v-list-item-title>{{ $t('superAdmin') }}</v-list-item-title>
              </v-list-item>
              <v-list-item value="product_manager" @click="switchRole('product_manager')">
                <v-list-item-title>{{ $t('productManager') }}</v-list-item-title>
              </v-list-item>
              <v-list-item value="match_specialist" @click="switchRole('match_specialist')">
                <v-list-item-title>{{ $t('matchSpecialist') }}</v-list-item-title>
              </v-list-item>
              <v-list-item value="user" @click="switchRole('user')">
                <v-list-item-title>{{ $t('normalUser') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item v-if="authStore.canAccessRoute('dashboard')" prepend-icon="mdi-view-dashboard" :title="$t('dashboard')" value="dashboard" to="/dashboard"></v-list-item>
        <v-list-item v-if="authStore.canAccessRoute('files')" prepend-icon="mdi-file" :title="$t('files')" value="files" to="/files"></v-list-item>
        <v-list-item v-if="authStore.canAccessRoute('users')" prepend-icon="mdi-account-group" :title="$t('users')" value="users" to="/users"></v-list-item>
        <v-list-item v-if="authStore.canAccessRoute('themesettings')" prepend-icon="mdi-palette" :title="$t('themeSettings')" value="theme-settings" to="/theme-settings"></v-list-item>
        <v-list-item v-if="authStore.canAccessRoute('datadictionary')" prepend-icon="mdi-database" :title="$t('dataDictionary')" value="data-dictionary" to="/data-dictionary"></v-list-item>
        <v-list-item v-if="authStore.canAccessRoute('systemconfig')" prepend-icon="mdi-cog-box" :title="$t('systemConfig')" value="system-config" to="/system-config"></v-list-item>
        <v-list-item v-if="authStore.canAccessRoute('settings')" prepend-icon="mdi-cog" :title="$t('settings')" value="settings" to="/settings"></v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="error" @click="logout">{{ $t('logout') }}</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app color="surface" density="compact" elevation="0" class="border-b">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="medium-emphasis"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-subtitle-1 font-weight-bold pl-0">{{ $t(currentRouteName) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip size="small" color="primary" class="mr-2" variant="flat">{{ authStore.user.role }}</v-chip>
      <v-btn icon density="comfortable" @click="toggleTheme" color="medium-emphasis">
        <v-icon size="small">{{ themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="bg-background d-flex flex-column" style="height: 100vh; overflow-y: auto; padding-bottom: 90px !important;">
      <router-view v-slot="{ Component }">
        <v-fade-transition mode="out-in">
          <component :is="Component" />
        </v-fade-transition>
      </router-view>
    </v-main>

    <v-bottom-navigation
      v-model="activeBtn"
      grow
      color="primary"
      density="comfortable"
      class="rounded-xl elevation-6 position-fixed"
      style="bottom: 16px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 600px; z-index: 1000;"
      height="64"
    >
      <v-btn v-if="authStore.canAccessRoute('product')" value="product" to="/product" class="rounded-xl">
        <v-icon size="24">mdi-package-variant</v-icon>
        <span class="text-caption mt-1 font-weight-medium">{{ $t('product') }}</span>
      </v-btn>

      <v-btn v-if="authStore.canAccessRoute('matching')" value="matching" to="/matching" class="rounded-xl">
        <v-icon size="24">mdi-link-variant</v-icon>
        <span class="text-caption mt-1 font-weight-medium">{{ $t('matching') }}</span>
      </v-btn>

      <v-btn v-if="authStore.canAccessRoute('car')" value="car" to="/car" class="rounded-xl">
        <v-icon size="24">mdi-car</v-icon>
        <span class="text-caption mt-1 font-weight-medium">{{ $t('car') }}</span>
      </v-btn>
    </v-bottom-navigation>

    <ConfirmDialog />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useAuthStore, type Role } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const drawer = ref(false)
const router = useRouter()
const route = useRoute()
const activeBtn = ref('product')
const authStore = useAuthStore()
const themeStore = useThemeStore()

const currentRouteName = computed(() => {
  return route.name ? route.name.toString().toLowerCase() : ''
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const switchRole = (role: Role) => {
  authStore.login(role)
  // Redirect to dashboard if current route is not accessible
  if (!authStore.canAccessRoute(currentRouteName.value)) {
    router.push('/dashboard')
  }
}
</script>
