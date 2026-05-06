<template>
  <v-dialog v-model="store.show" max-width="320" persistent content-class="confirm-dialog-content">
    <v-card class="rounded-lg text-center pa-0 overflow-hidden" elevation="0">
      <div class="pa-4 pb-2" v-if="store.title">
        <div class="text-subtitle-1 font-weight-bold">{{ store.title }}</div>
      </div>
      <div class="pa-4 pt-0 text-body-2 text-medium-emphasis">
        {{ store.content }}
      </div>
      <v-divider></v-divider>
      <div class="d-flex">
        <v-btn
          variant="text"
          class="flex-grow-1 rounded-0 text-body-2"
          height="48"
          color="medium-emphasis"
          @click="store.handleCancel"
        >
          {{ store.cancelText }}
        </v-btn>
        <v-divider vertical></v-divider>
        <v-btn
          variant="text"
          class="flex-grow-1 rounded-0 text-body-2 font-weight-bold"
          height="48"
          color="primary"
          @click="store.handleConfirm"
        >
          {{ store.confirmText }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useConfirmStore } from '../stores/confirm'

const store = useConfirmStore()
</script>

<style scoped>
/* Ensure the dialog has a clean look */
:deep(.v-overlay__content) {
  border-radius: 12px;
}
</style>
