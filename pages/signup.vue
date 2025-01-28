<script setup lang="ts">
// All initial logic declarations
const { status } = useAuth();
let allowSignups = useRuntimeConfig().public.allowSignups

useSeoMeta({
  title: 'Excalihub - Signup',
  ogTitle: 'Excalihub - Signup',
  description: 'Signup for Excalihub',
  ogDescription: 'Signup for Excalihub',
})

if (status.value === "authenticated") {
	navigateTo("/hub");
} else if (allowSignups != "true") {
	navigateTo("/login")
}
</script>

<template>
	<appNav />

	<div class="px-4 sm:mx-0">
		<signupForm class="mt-[15vh]" />
	</div>
</template>
