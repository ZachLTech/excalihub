<script setup>
const { status } = useAuth();
const loading = ref(false);
const error = ref('');
const rooms = ref([]);
const newRoom = ref({
    name: '',
    description: '',
    readOnlyUrl: '',
    excalidrawFile: ''
});

onMounted(async () => {
    await fetchRooms();
});

async function createNewRoom() {
    loading.value = true;
    error.value = '';
    
    try {
        await $fetch('/api/rooms/create', {
            method: 'POST',
            body: newRoom.value
        });
        
        newRoom.value = {
            name: '',
            description: ''
        };
        
        await fetchRooms();
    } catch (e) {
        error.value = e?.response?._data?.statusMessage || 'Failed to create room';
        console.error(e)
    } finally {
        loading.value = false;
    }
}

async function fetchRooms() {
    loading.value = true;
    error.value = '';
    
    try {
        const userRooms = await $fetch('/api/rooms/getData', {
            method: 'POST',
            body: {
                roomId: ''
            }
        });
        rooms.value = userRooms
    } catch (e) {
        error.value = e?.response?._data?.statusMessage || 'Failed to fetch rooms';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div v-if="status === 'authenticated'">
        <div v-if="error" role="alert">
            {{ error }}
        </div>

        <div v-if="loading" role="status">
            Loading...
        </div>

        <form @submit.prevent="createNewRoom">
            <input 
                v-model="newRoom.name"
                type="text"
                placeholder="Room Name"
                required
            />
            <input 
                v-model="newRoom.description"
                type="text"
                placeholder="Description (optional)"
            />
            <input 
                v-model="newRoom.readOnlyUrl"
                type="text"
                placeholder="Read Only URL to make room."
            />
            <!-- <input 
                v-model="newRoom.excalidrawFile"
                type="in"
                placeholder="Excalidraw File to room"
            /> -->
            <button type="submit" :disabled="loading">
                Create Room
            </button>
        </form>

        <div v-if="rooms.length">
            <div v-for="room in rooms" :key="room.id">
                <h3>{{ room.name }}</h3>
                <p v-if="room.description">{{ room.description }}</p>
                <NuxtLink :to="room.excalidrawUrl" target="_blank">
                    Open in Excalidraw
                </NuxtLink>
                <p>Created: {{ new Date(room.createdAt).toLocaleDateString() }}</p>
            </div>
        </div>
        <div v-else-if="!loading">
            No rooms found
        </div>
    </div>
</template>