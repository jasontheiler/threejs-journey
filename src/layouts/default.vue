<template>
  <div>
    <NuxtLink
      :to="{ name: 'index' }"
      class="fixed left-6 top-6 z-9999 w-12 h-12 flex justify-center items-center border border-white/10 rounded-full bg-black/50 backdrop-filter backdrop-blur-4 shadow shadow-black/33 hover:(text-white) sm:(w-32)"
    >
      <span class="i-ri-arrow-left-line sm:(-ml-1)" />
      <span class="hidden sm:(inline)">&nbsp;Go&nbsp;back</span>
    </NuxtLink>

    <slot />
  </div>
</template>
