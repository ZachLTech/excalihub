<script setup lang="ts">
const props = defineProps<{
  room: {
    id: string;
    name: string;
    description?: string;
    excalidrawUrl: string;
    createdAt: string;
    status: string;
  }
}>();

const emit = defineEmits(['showDetails']);
</script>

<template>
  <a :href="room.excalidrawUrl" target="_blank" class="bg-secondary bg-opacity-5 rounded-lg p-6 hover:bg-opacity-10 transition-all">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-text mb-2">{{ room.name }}</h3>
        <p v-if="room.description" class="text-gray-400 text-sm mb-4 line-clamp-2">
          {{ room.description }}
        </p>
      </div>
      <button 
        @click.stop.prevent="emit('showDetails')"
        class="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-secondary hover:bg-opacity-10 z-50"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
    <div class="flex items-center gap-2 mt-4 text-sm text-gray-400 ">
      <span>{{ new Date(room.createdAt).toLocaleDateString() }}</span>
      <span>•</span>
      <span class="capitalize">{{ room.status.toLowerCase() }}</span>
    </div>
  </a>
</template>