<template>
  <v-container class="fill-height bg-background" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-2 rounded-lg pa-4">
          <div class="text-center mb-6 mt-4">
            <v-icon size="48" color="primary" class="mb-2">mdi-car-connected</v-icon>
            <div class="text-h5 font-weight-bold text-primary">{{ $t('systemTitle') }}</div>
          </div>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                :label="$t('username')"
                name="login"
                prepend-inner-icon="mdi-account"
                type="text"
                v-model="username"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="mb-2"
              ></v-text-field>

              <v-text-field
                id="password"
                :label="$t('password')"
                name="password"
                prepend-inner-icon="mdi-lock"
                type="password"
                v-model="password"
                variant="outlined"
                density="comfortable"
                color="primary"
              ></v-text-field>
              
              <v-btn 
                block 
                color="primary" 
                size="large" 
                type="submit" 
                :loading="loading" 
                class="mt-4"
              >
                {{ $t('login') }}
              </v-btn>
            </v-form>

            <div class="mt-6">
              <div class="text-caption text-center text-medium-emphasis mb-2">{{ $t('quickLoginDemo') }}</div>
              <div class="d-flex flex-wrap gap-2 justify-center">
                <v-chip 
                  color="purple" 
                  variant="outlined" 
                  class="ma-1" 
                  @click="quickLogin('super_admin')"
                  prepend-icon="mdi-shield-crown"
                >
                  {{ $t('superAdmin') }}
                </v-chip>
                <v-chip 
                  color="blue" 
                  variant="outlined" 
                  class="ma-1" 
                  @click="quickLogin('product_manager')"
                  prepend-icon="mdi-package-variant"
                >
                  {{ $t('productManager') }}
                </v-chip>
                <v-chip 
                  color="orange" 
                  variant="outlined" 
                  class="ma-1" 
                  @click="quickLogin('match_specialist')"
                  prepend-icon="mdi-link-variant"
                >
                  {{ $t('matchSpecialist') }}
                </v-chip>
                <v-chip 
                  color="grey" 
                  variant="outlined" 
                  class="ma-1" 
                  @click="quickLogin('user')"
                  prepend-icon="mdi-account"
                >
                  {{ $t('normalUser') }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSnackbarStore } from '../stores/snackbar'
import { useAuthStore, type Role } from '../stores/auth'

const { t } = useI18n()
const snackbar = useSnackbarStore()
const authStore = useAuthStore()
const router = useRouter()

const username = ref('admin')
const password = ref('123456')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simple check for demo purposes, or map admin to super_admin
    if (username.value === 'admin' && password.value === '123456') {
      authStore.login('super_admin')
      snackbar.showMessage(t('loginSuccess'), 'success')
      router.push('/dashboard')
    } else {
      snackbar.showMessage(t('invalidCredentials'), 'error')
    }
  } catch (e) {
    snackbar.showMessage(t('loginFailed'), 'error')
  } finally {
    loading.value = false
  }
}

const quickLogin = (role: Role) => {
  loading.value = true
  setTimeout(() => {
    authStore.login(role)
    snackbar.showMessage(`${t('loginSuccess')} - ${authStore.user.name}`, 'success')
    router.push('/dashboard')
    loading.value = false
  }, 500)
}
</script>
