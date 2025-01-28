<script setup lang="ts">
// All initial logic declarations
const { status } = useAuth();

useSeoMeta({
  title: 'Excalihub - Login',
  ogTitle: 'Excalihub - Login',
  description: 'Login to Excalihub',
  ogDescription: 'Login to Excalihub',
})

if (status.value === "authenticated") {
	navigateTo("/hub");
}
</script>

<template>
	<appNav />

	<div class="px-4 sm:mx-0">
		<loginForm class="mt-[15vh]" />
	</div>
</template>
