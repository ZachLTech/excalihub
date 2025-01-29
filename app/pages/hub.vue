<script setup>
const { status } = useAuth();
const loading = ref(false);
const error = ref("");
const modalError = ref("");
const rooms = ref([]);
const archivedRooms = ref([]);
const showNewRoomModal = ref(false);
const showImportRoomModal = ref(false);
const showRoomDetailsModal = ref(false);
const showArchived = ref(false)
const selectedRoom = ref(null);
const newRoom = ref({
	name: "",
	description: "",
	readOnlyUrl: "",
	excalidrawFile: "",
});
const importRoom = ref({
	name: "",
	description: "",
	excalidrawUrl: "",
});
const updateRoomInfo = ref({
	name: "",
	description: "",
});

if (status.value === "unauthenticated") {
	navigateTo("/login");
}

useSeoMeta({
  title: 'Excalihub - Your Hub',
  ogTitle: 'Excalihub - Your Hub',
  description: 'Hub with all your Excalidraw boards.',
  ogDescription: 'Hub with all your Excalidraw boards.',
})

onMounted(async () => {
	loading.value = true;
	await fetchRooms();
	loading.value = false;
});

async function createNewRoom() {
	loading.value = true;
	modalError.value = "";

	newRoom.value.name = newRoom.value.name.trim();
	newRoom.value.description = newRoom.value.description.trim();
	newRoom.value.readOnlyUrl = newRoom.value.readOnlyUrl.trim();

	if (
		newRoom.value.readOnlyUrl &&
		!newRoom.value.readOnlyUrl.includes("#json=")
	) {
		modalError.value = "You must use a valid READ ONLY excalidraw URL.";
		loading.value = false;
		return;
	}

	try {
		const createdRoom = await $fetch("/api/rooms/create", {
			method: "POST",
			body: newRoom.value,
		});

		newRoom.value = {
			name: "",
			description: "",
			readOnlyUrl: "",
			excalidrawFile: "",
		};

		rooms.value.push(createdRoom);
		showNewRoomModal.value = false;
	} catch (e) {
		error.value =
			e?.response?._data?.statusMessage || "Failed to create room";
		console.error(e);
	} finally {
		loading.value = false;
	}
}

async function importNewRoom() {
	loading.value = true;
	modalError.value = "";

	importRoom.value.name = importRoom.value.name.trim();
	importRoom.value.description = importRoom.value.description.trim();
	importRoom.value.excalidrawUrl = importRoom.value.excalidrawUrl.trim();

	if (
		importRoom.value.excalidrawUrl &&
		!importRoom.value.excalidrawUrl.includes("#room=")
	) {
		modalError.value = "You must use a valid live room excalidraw URL.";
		loading.value = false;
		return;
	}

	try {
		const newRoom = await $fetch("/api/rooms/import", {
			method: "POST",
			body: importRoom.value,
		});

		importRoom.value = {
			name: "",
			description: "",
			excalidrawUrl: "",
		};

		rooms.value.push(newRoom);
	} catch (e) {
		error.value =
			e?.response?._data?.statusMessage || "Failed to import room";
		console.error(e);
	} finally {
		showImportRoomModal.value = false;
		loading.value = false;
	}
}

async function updateRoom(roomId) {
	loading.value = true;
	error.value = "";

	try {
		const updatedRoom = await $fetch("/api/rooms/update", {
			method: "POST",
			body: {
				roomID: roomId,
				name: updateRoomInfo.value.name.trim(),
				description: updateRoomInfo.value.description.trim(),
			},
		});

		const index = rooms.value.findIndex((r) => r.id === roomId);
		rooms.value[index] = updatedRoom;
		showRoomDetailsModal.value = false;
	} catch (e) {
		error.value =
			e?.response?._data?.statusMessage || "Failed to update room";
		console.error(e);
	} finally {
		loading.value = false;
	}
}

async function archiveRoom(roomId) {
	if (
		!confirm(
			"Are you sure you want to archive this room? It will make it permanently read-only and you'll only be able to delete it from here on."
		)
	)
		return;

	loading.value = true;
	error.value = "";

	try {
		await $fetch("/api/rooms/archive", {
			method: "POST",
			body: {
				roomID: roomId,
			},
		});

		const index = rooms.value.findIndex((r) => r.id === roomId);
		if (index !== -1) {
			const room = rooms.value[index];
			room.status = "ARCHIVED";
			archivedRooms.value.push(room);
			rooms.value = rooms.value.filter((r) => r.id !== roomId);
		}

		showRoomDetailsModal.value = false;
	} catch (e) {
		error.value =
			e?.response?._data?.statusMessage || "Failed to archive room";
		console.error(e);
	} finally {
		loading.value = false;
	}
}

async function deleteRoom(roomId) {
	if (!confirm("Are you sure you want to delete this room?")) return;

	loading.value = true;
	error.value = "";

	try {
		await $fetch("/api/rooms/delete", {
			method: "POST",
			body: {
				roomID: roomId,
			},
		});

		rooms.value = rooms.value.filter((r) => r.id !== roomId);
		archivedRooms.value = archivedRooms.value.filter((r) => r.id !== roomId);
		showRoomDetailsModal.value = false;
	} catch (e) {
		error.value =
			e?.response?._data?.statusMessage || "Failed to delete room";
		console.error(e);
	} finally {
		loading.value = false;
	}
}

async function fetchRooms() {
	loading.value = true;
	error.value = "";

	try {
		const userRooms = await $fetch("/api/rooms/getData", {
			method: "POST",
			body: {
				roomId: "",
			},
		});

		archivedRooms.value = userRooms.filter(
			(room) => room.status === "ARCHIVED"
		);
		rooms.value = userRooms.filter((room) => room.status !== "ARCHIVED");
	} catch (e) {
		error.value =
			e?.response?._data?.statusMessage || "Failed to fetch rooms";
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<appNav />

	<div
		v-if="loading"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
	>
		<div class="relative w-20 h-20">
			<div
				class="absolute w-full h-full border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"
			></div>
			<div
				class="absolute w-full h-full flex items-center justify-center text-2xl opacity-30"
			>
				🤔
			</div>
			<div
				class="absolute w-full h-full border-4 border-r-secondary border-l-secondary border-t-transparent border-b-transparent rounded-full animate-ping"
			></div>
			<div
				class="absolute w-full h-full flex items-center justify-center text-lg text-gray-300 text-opacity-30 mt-16"
			>
				Loading
			</div>
		</div>
	</div>

	<div
		class="container mx-auto mt-20 py-4 border-t-2 border-secondary border-opacity-15 max-w-6xl"
	>
		<div
			class="flex items-center gap-2 pb-4 border-b-2 border-secondary border-opacity-15"
		>
			<button
				@click="
					showNewRoomModal = true;
					modalError = '';
				"
				class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
			>
				New Room
			</button>
			<button
				@click="
					showImportRoomModal = true;
					modalError = '';
				"
				class="px-4 py-2 bg-secondary bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all"
			>
				Import Room
			</button>
		</div>

		<div
			v-if="error"
			class="w-full mb-4 mt-4 p-3 bg-red-500 bg-opacity-20 text-red-500 rounded-lg flex justify-between items-center"
		>
			<p>{{ error }}</p>
			<button @click="error = ''" class="text-red-500 hover:text-red-400">
				<svg
					class="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					></path>
				</svg>
			</button>
		</div>

		<div
			v-if="loading"
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4"
		>
			<div
				v-for="n in 6"
				:key="n"
				class="bg-secondary bg-opacity-10 rounded-lg p-6 animate-pulse"
			>
				<div
					class="h-6 bg-secondary bg-opacity-20 rounded w-3/4 mb-4"
				></div>
				<div
					class="h-4 bg-secondary bg-opacity-20 rounded w-1/2 mb-2"
				></div>
				<div class="h-4 bg-secondary bg-opacity-20 rounded w-1/3"></div>
			</div>
		</div>

		<div
			v-if="rooms.length > 0"
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4"
		>
			<roomCard
				v-for="room in rooms"
				:key="room.id"
				:room="room"
				@showDetails="
					selectedRoom = room;
					showRoomDetailsModal = true;
				"
			/>
		</div>

		<div v-if="archivedRooms.length > 0">
			<div class="flex items-center gap-3 w-full pb-4 mb-4 border-b-2 border-b-secondary border-opacity-15">
				<h2
					class="text-xl font-semibold text-gray-300"
				>
					Archived Rooms
				</h2>
				<button class="text-text underline text-sm" @click="showArchived = !showArchived">
					{{ showArchived? "Hide" : "Show" }}
				</button>
			</div>
			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4"
				v-if="showArchived"
			>
				<roomCard
					v-for="room in archivedRooms"
					:key="room.id"
					:room="room"
					@showDetails="
						selectedRoom = room;
						showRoomDetailsModal = true;
					"
				/>
			</div>
		</div>

		<div
			v-if="rooms.length <= 0 && archivedRooms <= 0 && !loading"
			class="w-full h-64 p-12 justify-center items-center text-center"
		>
			<svg
				class="mx-auto h-12 w-12 text-gray-400"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
			>
				<circle cx="12" cy="12" r="10" stroke-width="2" />
				<path d="M8 9h.01" stroke-width="2" stroke-linecap="round" />
				<path d="M16 9h.01" stroke-width="2" stroke-linecap="round" />
				<path
					d="M16 16c0-2-1.791-4-4-4s-4 2-4 4"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-text">No rooms yet</h3>
			<p class="mt-1 text-sm text-gray-500">
				Get started by creating a new room!
			</p>
		</div>

		<baseModal
			:is-open="showNewRoomModal"
			title="Create New Room"
			@close="showNewRoomModal = false"
		>
			<div
				v-if="modalError"
				class="w-full mb-4 p-3 bg-red-500 bg-opacity-20 text-red-500 rounded-lg"
			>
				{{ modalError }}
			</div>
			<form @submit.prevent="createNewRoom">
				<div class="space-y-4">
					<div>
						<label
							class="block text-sm font-medium text-gray-400 mb-1"
						>
							Title<span class="text-red-500">*</span>
						</label>
						<input
							v-model="newRoom.name"
							type="text"
							placeholder="(i.e. My Room)"
							required
							class="w-full p-3 bg-secondary bg-opacity-10 focus:bg-opacity-15 rounded-lg border-0 focus:border-0 focus:ring-0 ring-0"
						/>
					</div>
					<div>
						<label
							class="block text-sm font-medium text-gray-400 mb-1"
							>Description</label
						>
						<input
							v-model="newRoom.description"
							type="text"
							placeholder="(i.e. A room that is mine)"
							class="w-full p-3 bg-secondary bg-opacity-10 focus:bg-opacity-15 rounded-lg border-0 focus:border-0 focus:ring-0 ring-0"
						/>
					</div>
					<p
						class="font-semibold pt-2 border-t-2 border-t-secondary border-opacity-15"
					>
						From Read-Only URL
					</p>
					<div>
						<label
							class="block text-sm font-medium text-gray-400 mb-1"
							>Read-Only Excalidraw URL</label
						>
						<input
							v-model="newRoom.readOnlyUrl"
							type="text"
							placeholder="(i.e. https://excalidraw.com/#json=...)"
							class="w-full p-3 bg-secondary bg-opacity-10 focus:bg-opacity-15 rounded-lg border-0 focus:border-0 focus:ring-0 ring-0"
						/>
					</div>
					<button
						type="submit"
						class="w-full py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-75 disabled:cursor-not-allowed"
						:disabled="loading"
					>
						Create Room
					</button>
				</div>
			</form>
		</baseModal>

		<baseModal
			:is-open="showImportRoomModal"
			title="Import Room"
			@close="showImportRoomModal = false"
		>
			<div
				v-if="modalError"
				class="w-full mb-4 p-3 bg-red-500 bg-opacity-20 text-red-500 rounded-lg"
			>
				{{ modalError }}
			</div>
			<form @submit.prevent="importNewRoom">
				<div class="space-y-4">
					<div>
						<label
							class="block text-sm font-medium text-gray-400 mb-1"
						>
							Title<span class="text-red-500">*</span>
						</label>
						<input
							v-model="importRoom.name"
							type="text"
							placeholder="(i.e. My Room)"
							required
							class="w-full p-3 bg-secondary bg-opacity-10 focus:bg-opacity-15 rounded-lg border-0 focus:border-0 focus:ring-0 ring-0"
						/>
					</div>
					<div>
						<label
							class="block text-sm font-medium text-gray-400 mb-1"
							>Description</label
						>
						<input
							v-model="importRoom.description"
							type="text"
							placeholder="(i.e. A room that is mine)"
							class="w-full p-3 bg-secondary bg-opacity-10 focus:bg-opacity-15 rounded-lg border-0 focus:border-0 focus:ring-0 ring-0"
						/>
					</div>
					<div>
						<label
							class="block text-sm font-medium text-gray-400 mb-1"
							>Room URL</label
						>
						<input
							v-model="importRoom.excalidrawUrl"
							type="url"
							placeholder="(i.e. https://excalidraw.com/#room=...)"
							required
							class="w-full p-3 bg-secondary bg-opacity-10 focus:bg-opacity-15 rounded-lg border-0 focus:border-0 focus:ring-0 ring-0"
						/>
					</div>
					<button
						type="submit"
						class="w-full py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-75 disabled:cursor-not-allowed"
						:disabled="loading"
					>
						Import Room
					</button>
				</div>
			</form>
		</baseModal>

		<baseModal
			v-if="selectedRoom"
			:is-open="showRoomDetailsModal"
			:title="selectedRoom.name"
			@close="showRoomDetailsModal = false"
		>
			<div class="space-y-4">
				<p class="text-gray-400">
					{{ selectedRoom.description || "No description provided" }}
				</p>

				<form
					v-if="selectedRoom.status != 'ARCHIVED'"
					@submit.prevent="updateRoom(selectedRoom.id)"
					class="space-y-4"
				>
					<div>
						<label
							class="block text-sm font-medium text-gray-400 mb-1"
							>Update Title</label
						>
						<input
							v-model="updateRoomInfo.name"
							type="text"
							class="w-full p-3 bg-secondary bg-opacity-10 focus:bg-opacity-15 rounded-lg border-0 focus:border-0 focus:ring-0 ring-0"
						/>
					</div>
					<div>
						<label
							class="block text-sm font-medium text-gray-400 mb-1"
							>Update Description</label
						>
						<input
							v-model="updateRoomInfo.description"
							type="text"
							class="w-full p-3 bg-secondary bg-opacity-10 focus:bg-opacity-15 rounded-lg border-0 focus:border-0 focus:ring-0 ring-0"
						/>
					</div>
					<button
						type="submit"
						class="w-full py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
					>
						Update Room
					</button>
				</form>

				<div
					class="flex gap-2 pt-4 border-t border-secondary border-opacity-15"
				>
					<button
						@click="archiveRoom(selectedRoom.id)"
						class="flex-1 py-2 bg-secondary bg-opacity-20 text-white rounded-lg hover:bg-opacity-30"
						v-if="selectedRoom.status != 'ARCHIVED'"
					>
						Archive Room
					</button>
					<button
						@click="deleteRoom(selectedRoom.id)"
						class="flex-1 py-2 bg-red-500 bg-opacity-20 text-red-500 rounded-lg hover:bg-opacity-30"
					>
						Delete Room
					</button>
				</div>
			</div>
		</baseModal>
	</div>
</template>
