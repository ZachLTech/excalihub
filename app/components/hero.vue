<template>
    <div class="relative flex flex-col justify-center items-center w-full min-h-screen overflow-x-hidden ">
      <div class="flex flex-col justify-center items-center gap-14 max-w-[900px] px-6 py-8 rounded-2xl z-10" v-motion :initial="{ opacity: 0, y: 80 }" :enter="{ opacity: 1, y: 0 }" :transition="{ duration: 2800 }">
        <h1 class="text-5xl md:text-7xl font-semibold font-sans text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :transition="{ delay: 300 }">
          Effortless Organization
          <br />
          all in one place
        </h1>
  
        <div class="w-full flex flex-col justify-center items-center gap-8" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :transition="{ delay: 600 }">
          <p class="text-xl md:text-2xl text-center max-w-[800px] text-gray-700 dark:text-gray-300">
            Keep all your live Excalidraw boards organized in one free, open-source, and privacy-focused hub.
          </p>
          
          <NuxtLink to="/signup" class="px-5 cursor-pointer flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-[#fff] dark:text-[#fff] rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            Try it out
            <svg class="w-6 h-4 pt-[3px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
              <path 
                d="M16 0L14.59 1.41L19.17 6H0V8H19.17L14.59 12.59L16 14L23 7L16 0Z" 
                fill="currentColor"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </template>
  
  <script>
    export default {
      props: {
        location: {
          type: String
        }
      }
    }
  </script>
  
  <style>
  @keyframes border-trace {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }
  
  @keyframes fade-in{
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  
  .animate-fade-in{
    animation: fade-in 5s linear
  }
  
  .animate-border-trace {
    background: linear-gradient(
      to right,
      #38bdf8,
      #486eec,
      #202fb6,
      #38bdf8
    );
    background-size: 200% 200%;
    animation: border-trace 5s linear infinite;
    mask-image: linear-gradient(#fff 0 0);
    -webkit-mask-image: linear-gradient(#fff 0 0);
  }
  </style>