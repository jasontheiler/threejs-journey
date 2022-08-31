<script lang="ts" setup>
import { Motion, Presence } from "motion/vue";

const nuxtApp = useNuxtApp();

const progress = ref<number | null>(null);
const isProgressing = computed(() => progress.value !== null);

let trickleTimeout: NodeJS.Timeout;
const trickle = () => {
  progress.value! += (95.1 - progress.value!) / 2.5;
  if (progress.value! >= 95) progress.value = 95;
  else trickleTimeout = setTimeout(trickle, 500 + (Math.random() - 0.5) * 250);
};

nuxtApp.hook("page:start", () => {
  progress.value = 0;
  trickle();
});
nuxtApp.hook("page:finish", () => {
  if (!isProgressing.value) return;
  clearTimeout(trickleTimeout);
  progress.value = 100;
});

const onMotioncomplete = () => {
  if (progress.value === 100) progress.value = null;
};
</script>

<template>
  <Presence>
    <Motion
      v-if="isProgressing"
      :exit="{ opacity: 0 }"
      class="fixed inset-0 bottom-auto z-9999 overflow-hidden"
    >
      <Motion
        :initial="{ transform: 'translateX(-100%)' }"
        :animate="{ transform: `translateX(-${100 - progress!}%)` }"
        class="w-full h-0.5 bg-white"
        @motioncomplete="onMotioncomplete"
      />
    </Motion>
  </Presence>
</template>
