<template>
  <TheProgressBar />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
:focus:not(:focus-visible) {
  @apply !outline-none;
}

body {
  @apply bg-black font-sans text-lg text-gray-400;
}
</style>
