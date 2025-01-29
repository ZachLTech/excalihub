<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  title: string;
}>();

const emit = defineEmits(['close']);
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-opacity-30" @click="emit('close')"></div>
        <div class="relative bg-[#23222b] rounded-lg p-8 max-w-md w-full">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-text">{{ title }}</h3>
            <button @click="emit('close')" class="text-gray-400 hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>