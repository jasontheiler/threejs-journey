<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { animate } from "motion";

const canvas = ref<HTMLCanvasElement>();

const pane = useTweakpane();
const { addCamera, addSizable } = useThree(canvas);

onMounted(async () => {
  const scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(9999);
  axesHelper.visible = false;
  scene.add(axesHelper);

  const paneFolderAxesHelper = pane.value?.addFolder({
    title: "axesHelper",
    expanded: false,
  });
  paneFolderAxesHelper?.addInput(axesHelper, "visible");

  const galaxyParams = reactive({
    radius: 5,
    thickness: 1,
    arms: 4,
    armWidth: 0.5,
    armDistribution: 2,
    spiral: 1,
    stars: 100_000,
    starSize: 0.01,
    innerColor: "#ff303b",
    outerColor: "#1b6784",
    speed: 0.25,
  });

  const paneFolderGalaxy = pane.value?.addFolder({ title: "galaxy" });
  paneFolderGalaxy?.addInput(galaxyParams, "radius", {
    min: 0.01,
    max: 20,
    step: 0.01,
  });
  paneFolderGalaxy?.addInput(galaxyParams, "thickness", {
    min: 0,
    max: 5,
    step: 0.01,
  });
  paneFolderGalaxy?.addInput(galaxyParams, "arms", {
    min: 2,
    max: 10,
    step: 1,
  });
  paneFolderGalaxy?.addInput(galaxyParams, "armWidth", {
    min: 0,
    max: 5,
    step: 0.01,
  });
  paneFolderGalaxy?.addInput(galaxyParams, "armDistribution", {
    min: 1,
    max: 5,
    step: 0.001,
  });
  paneFolderGalaxy?.addInput(galaxyParams, "spiral", {
    min: -5,
    max: 5,
    step: 0.01,
  });
  paneFolderGalaxy?.addInput(galaxyParams, "stars", {
    min: 100,
    max: 1_000_000,
    step: 100,
  });
  paneFolderGalaxy?.addInput(galaxyParams, "starSize", {
    min: 0.001,
    max: 0.05,
    step: 0.001,
  });
  paneFolderGalaxy?.addInput(galaxyParams, "innerColor");
  paneFolderGalaxy?.addInput(galaxyParams, "outerColor");
  paneFolderGalaxy?.addInput(galaxyParams, "speed", {
    min: 0,
    max: 1,
    step: 0.001,
  });

  watchDebounced(
    galaxyParams,
    (
      {
        radius,
        thickness,
        arms,
        armWidth,
        armDistribution,
        spiral,
        stars,
        starSize,
        innerColor,
        outerColor,
        speed,
      },
      _,
      onCleanup
    ) => {
      const particles = new THREE.Points(
        new THREE.BufferGeometry(),
        new THREE.PointsMaterial()
      );
      const positions = new Float32Array(stars * 3);
      const colors = new Float32Array(stars * 3);

      for (let i = 0; i < stars; i++) {
        const i3 = i * 3;

        const distance = Math.random() * radius;
        const armAngle = 2 * Math.PI * ((i % arms) / arms);
        const spiralAngle = 2 * Math.PI * (distance / radius) * spiral;
        const angle = armAngle + spiralAngle;

        const getDistribution = () =>
          Math.pow(Math.random(), armDistribution) *
          Math.sign(Math.random() - 0.5);

        positions[i3] =
          Math.cos(angle) * distance + armWidth * getDistribution();
        positions[i3 + 1] =
          thickness * (1 - distance / radius) * getDistribution();
        positions[i3 + 2] =
          Math.sin(angle) * distance + armWidth * getDistribution();

        const color = new THREE.Color(innerColor).lerp(
          new THREE.Color(outerColor),
          distance / radius
        );

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }

      particles.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      particles.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );
      particles.material.size = starSize;
      particles.material.sizeAttenuation = true;
      particles.material.depthWrite = false;
      particles.material.blending = THREE.AdditiveBlending;
      particles.material.vertexColors = true;
      scene.add(particles);

      const animation = animate(
        (progress) => {
          particles.rotation.y = 2 * Math.PI * Math.sign(spiral) * progress;
        },
        {
          duration: (2 * Math.PI) / speed,
          easing: "linear",
          repeat: Infinity,
        }
      );

      onCleanup(() => {
        animation.cancel();
        scene.remove(particles);
        particles.geometry.dispose();
        particles.material.dispose();
      });
    },
    {
      immediate: true,
      debounce: 500,
    }
  );

  const camera = addCamera(new THREE.PerspectiveCamera(60));
  camera.position.set(0, 4, 8);
  scene.add(camera);

  const controls = new OrbitControls(camera, canvas.value);
  controls.enablePan = false;
  controls.enableDamping = true;

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
