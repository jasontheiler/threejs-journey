<script lang="ts" setup>
import * as THREE from "three";
import { DeviceOrientationControls } from "~/utils";

const _ = undefined;

const canvas = ref<HTMLCanvasElement>();

const { addCamera, addSizable } = useThree(canvas);

onMounted(async () => {
  const loaderManager = new THREE.LoadingManager();
  // const textureLoader = new THREE.TextureLoader(loaderManager);
  const cubeTextureLoader = new THREE.CubeTextureLoader(loaderManager);
  // const fontLoader = new STDLIB.FontLoader(loaderManager);

  const cubeTex = cubeTextureLoader.load([
    "/textures/environment-maps/0/px.jpg",
    "/textures/environment-maps/0/nx.jpg",
    "/textures/environment-maps/0/py.jpg",
    "/textures/environment-maps/0/ny.jpg",
    "/textures/environment-maps/0/pz.jpg",
    "/textures/environment-maps/0/nz.jpg",
  ]);

  const scene = new THREE.Scene();
  scene.background = cubeTex;

  const camera = addCamera(new THREE.PerspectiveCamera(60));
  scene.add(camera);

  const controls = new DeviceOrientationControls(camera);

  const renderer = addSizable(
    new THREE.WebGLRenderer({
      canvas: canvas.value,
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    })
  );

  useRafFn(() => {
    controls.update();

    renderer.render(scene, camera);
  });
});
</script>

<template>
  <div class="w-full h-screen">
    <canvas ref="canvas" class="w-full h-full block" />
  </div>
</template>
