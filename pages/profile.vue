<script setup lang="ts">
  const { data, status, signOut } = useAuth();

  if (status.value === 'unauthenticated') {
    navigateTo('/login');
  }
</script>

<template>
  <p>Profile</p>
  <NuxtLink to="/">Home</NuxtLink>
  <button @click="signOut()">Sign Out</button>
  <h1>Here's your profile data: </h1>
  <pre>{{ data }}</pre>
</template>