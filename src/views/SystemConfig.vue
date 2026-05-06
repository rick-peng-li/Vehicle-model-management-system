<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="rounded-lg" elevation="0" border>
          <v-card-title class="text-h5">
            {{ $t('systemConfig') }}
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="config.systemName"
                    :label="$t('systemName')"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="config.version"
                    :label="$t('version')"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="config.description"
                    :label="$t('systemDescription')"
                    variant="outlined"
                    rows="3"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="config.maintenanceMode"
                    :label="$t('maintenanceMode')"
                    color="warning"
                    hide-details
                    inset
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="config.allowRegistration"
                    :label="$t('allowRegistration')"
                    color="success"
                    hide-details
                    inset
                  ></v-switch>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="elevated" @click="save">
              {{ $t('save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card :title="$t('systemInfo')">
          <v-list density="compact">
            <v-list-item :title="$t('serverTime')" subtitle="2023-10-27 10:00:00"></v-list-item>
            <v-list-item :title="$t('uptime')" :subtitle="$t('uptimeValue')"></v-list-item>
            <v-list-item :title="$t('nodeVersion')" subtitle="v18.16.0"></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useSnackbarStore } from '../stores/snackbar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const snackbarStore = useSnackbarStore()

const config = reactive({
  systemName: t('defaultSystemName'),
  version: '1.0.0',
  description: t('defaultSystemDesc'),
  maintenanceMode: false,
  allowRegistration: true
})

const save = () => {
  // Mock save
  snackbarStore.showMessage(t('configSaved'), 'success')
}
</script>
