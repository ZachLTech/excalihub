<script setup>
useSeoMeta({
  title: 'Excalihub - Home',
  ogTitle: 'Excalihub - Home',
  description: 'Excalihub - Your centralized hub for creating, managing, organizing, and enhancing Excalidraw whiteboards',
  ogDescription: 'Excalihub - Your centralized hub for creating, managing, organizing, and enhancing Excalidraw whiteboards',
})
</script>

<template>
    <appNav />

    <section class="flex justify-center items-center">
        <hero />
    </section>
    
    <section id="features" class="w-full flex justify-center items-center mb-24">
        <div class="max-w-[1500px] flex justify-center flex-wrap">
            <featureCard :title="'Aggregate'" :description="'Compile, create, and store all of your excalidraw rooms into this simplified hub'" />
            <featureCard :title="'Template (Coming Soon)'" :description="'Make template whiteboards for creating pre-formatted excalidraw rooms'" />
            <featureCard :title="'Backup (Coming Soon)'" :description="'Automatically backup and save your excalidraw room state as snapshots'" />
            <featureCard :title="'Categorize (Coming Soon)'" :description="'Enhance your whiteboard organization by categorizing and marking your rooms to have special functionality'" />
            <featureCard :title="'Tabulate (Coming Soon)'" :description="'Expand your simple whiteboards to have multiple tabs for larger projects and more efficient organization'" />
            <featureCard :title="'Self Host (Coming Soon)'" :description="'Host your very own instance of Excalihub and enjoy all it\'s benefits and more while knowing your data is truly yours.'" />
        </div>
    </section>
</template>