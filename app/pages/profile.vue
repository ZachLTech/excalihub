<script setup lang="ts">
// Types
import type { User } from "@prisma/client";
// All initial logic declarations
const { status, signOut } = useAuth();
const loading = ref(false);
const error = ref("");
const success = ref("");
const hasChanges = ref(false);
const wantsToDeleteAccount = ref(false);
const currentUser = ref<User | null>(null);
const platformTitle = useRuntimeConfig().public.platformTitle;
const userInput = ref({
	name: "",
	email: "",
	password: ""
});
// If the user isn't even authenticated then they getting booted back to login
if (status.value === "unauthenticated") {
	navigateTo("/login");
}
// Runs this as soon as the page is mounted - gets user data
onMounted(async () => {
	loading.value = true;

	const userData = await $fetch("/api/user/getAllData");
	if (userData) {
		userInput.value = {
			name: userData.name || "",
			email: userData.email || "",
			password: ""
		};

		currentUser.value = {
			...userData,
			password: "Placeholder",
			createdAt: new Date(userData.createdAt),
			updatedAt: new Date(userData.updatedAt),
		};
	}

	
	useSeoMeta({
		title: `${platformTitle} - Your Profile` || 'Excalihub - Profile',
		ogTitle: `${platformTitle} - Your Profile` || 'Excalihub - Profile',
		description: `Profile to ${platformTitle}`,
		ogDescription: `Profile to ${platformTitle}`,
	})

	loading.value = false;
});
// Watches user input to enable save button when changes are present
watch(
	userInput,
	(newVal) => {
		if (!currentUser.value) return;

		hasChanges.value =
			newVal.name != currentUser.value.name ||
			newVal.email != currentUser.value.email ||
			newVal.password != ""
	},
	{ deep: true }
);
// Helper functions and form handling stuff
// Changes DB
async function deleteAccount() {
	loading.value = true;

	if (wantsToDeleteAccount) {
		await $fetch("/api/user/delete", {
			method: "POST",
		});
		signOut();
	} else {
		error.value =
			"There was an error trying to delete your account.";
		wantsToDeleteAccount.value = false;
		loading.value = false;
	}
}

function validateInput(updateInput: any): string {
	const emailRegex =
		/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
	const usernameRegex = /^[0-9A-Za-z\s-]{1,32}$/;
	const passwordRegex = /^(?=.*?[A-Z])(?=.*?[0-9]).{8,}$/;

	if (updateInput.email && !emailRegex.test(updateInput.email)) {
		return "The Email you entered is not valid.";
	} else if (updateInput.name && !usernameRegex.test(updateInput.name)) {
		return "Username should be between 2 and 16 characters. Alphanumeric & spaces only.";
	} else if (
		updateInput.password &&
		!passwordRegex.test(updateInput.password)
	) {
		return "Password should be at least 8 characters including a number and uppercase letter.";
	} else {
		return "";
	}
}

// Changes DB
async function updateProfile() {
	try {
		loading.value = true;

		userInput.value.email = userInput.value.email.trim().toLowerCase();
		userInput.value.name = userInput.value.name.trim();
		userInput.value.password = userInput.value.password.trim();

		error.value = validateInput(userInput.value);

		if (error.value != "") {
			return;
		}

		const updatedUser = await $fetch("/api/user/update", {
			method: "POST",
			body: userInput.value,
		});

		currentUser.value = {
			...updatedUser,
			password: "Placeholder",
			createdAt: new Date(updatedUser.createdAt),
			updatedAt: new Date(updatedUser.updatedAt),
		};

		if (updatedUser) {
			hasChanges.value = false;
			userInput.value.password = '';
			success.value = "Profile updated successfully!";
		}
	} catch (e: any) {
		error.value = e?.response?._data?.message || "Failed to update profile";
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<appNav />
	<div class="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto">
			<h1 class="text-3xl font-extrabold text-text mb-8">
				Profile Settings
			</h1>

			<div v-if="error" class="w-full flex justify-center">
				<div
					class="w-full mb-2 p-4 rounded-lg bg-red-500 bg-opacity-20 flex"
				>
					<button @click="error = ''" class="flex-shrink-0">
						<svg
							class="h-5 w-5 text-red-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-400">
							{{ error }}
						</h3>
					</div>
				</div>
			</div>

			<div v-if="success" class="w-full flex justify-center">
				<div
					class="w-full mb-2 p-4 rounded-lg bg-green-500 bg-opacity-20 flex"
				>
					<button @click="success = ''" class="flex-shrink-0">
						<svg
							class="h-5 w-5 text-green-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-green-400">
							{{ success }}
						</h3>
					</div>
				</div>
			</div>

			<form
				@submit.prevent="updateProfile"
				class="space-y-6 bg-secondary bg-opacity-5 p-8 rounded-lg"
			>
				<div>
					<label
						class="block text-sm font-medium text-secondary opacity-70 mb-2"
						>Name</label
					>
					<input
						v-model="userInput.name"
						type="text"
						placeholder="Your name"
						:disabled="loading"
						class="w-full p-4 bg-secondary bg-opacity-5 border-0 rounded-lg placeholder-secondary placeholder-opacity-25 focus:ring-secondary focus:ring-opacity-20text-textdisabled:bg-opacity-5 disabled:cursor-not-allowedtransition-all"
					/>
				</div>

				<div>
					<label
						class="block text-sm font-medium text-secondary opacity-70 mb-2"
						>Email</label
					>
					<input
						v-model="userInput.email"
						type="email"
						placeholder="Your email"
						:disabled="loading"
						class="w-full p-4 bg-secondary bg-opacity-5 border-0 rounded-lg placeholder-secondary placeholder-opacity-25 focus:ring-secondary focus:ring-opacity-20text-textdisabled:bg-opacity-5 disabled:cursor-not-allowedtransition-all"
					/>
				</div>

				<div>
					<label
						class="block text-sm font-medium text-secondary opacity-70 mb-2"
					>
						New Password (leave empty to keep current)
					</label>
					<input
						v-model="userInput.password"
						type="password"
						placeholder="New password"
						:disabled="loading"
						class="w-full p-4 bg-secondary bg-opacity-5 border-0 rounded-lg placeholder-secondary placeholder-opacity-25 focus:ring-secondary focus:ring-opacity-20text-textdisabled:bg-opacity-5 disabled:cursor-not-allowedtransition-all"
					/>
				</div>
				

				<button
					type="submit"
					:disabled="loading || !hasChanges"
					class="w-full py-4 bg-primary text-lg font-medium rounded-lg hover:bg-opacity-90 transition-alldisabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
				>
					{{
						loading
							? "Loading..."
							: hasChanges
							? "Save Changes"
							: "Saved"
					}}
				</button>
			</form>

			<div class="mt-8 bg-red-500 bg-opacity-10 p-8 rounded-lg">
				<h2 class="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
				<button
					@click="wantsToDeleteAccount = true"
					class="px-4 py-2 bg-red-500 text-text rounded hover:bg-opacity-90 transition-all"
				>
					Delete Account
				</button>

				<div
					v-if="wantsToDeleteAccount"
					class="mt-4 p-4 bg-red-500 bg-opacity-20 rounded-lg"
				>
					<p class="text-red-400 mb-4">
						Are you sure you want to delete your account?
					</p>
					<div class="flex gap-4">
						<button
							@click="deleteAccount()"
							class="px-4 py-2 bg-red-500 text-text rounded hover:bg-opacity-90 transition-all"
						>
							Yes, Delete
						</button>
						<button
							@click="wantsToDeleteAccount = false"
							class="px-4 py-2 bg-gray-600 text-text rounded hover:bg-opacity-90 transition-all"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
