<script lang="ts" setup>
definePageMeta({ layout: "empty" });
</script>

<template>
  <main class="w-full h-screen px-6 flex justify-center items-center">
    <div>
      <h1
        class="mb-12 font-bold text-5xl text-white leading-snug underline underline-6 underline-offset-3"
      >
        My Three.js Journey
      </h1>

      <ul class="list-inside list-disc leading-loose">
        <li>
          <NuxtLink :to="{ name: 'haunted-house' }" class="hover:(text-white)">
            Haunted House
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            :to="{ name: 'galaxy-generator' }"
            class="hover:(text-white)"
          >
            Galaxy Generator
          </NuxtLink>
        </li>

        <li>
          <NuxtLink :to="{ name: 'physics' }" class="hover:(text-white)">
            Physics
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            :to="{ name: 'playground' }"
            class="text-gray-700 hover:(text-gray-500)"
          >
            Playground
          </NuxtLink>
        </li>
      </ul>
    </div>
  </main>
</template>
