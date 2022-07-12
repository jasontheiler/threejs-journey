<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const _ = undefined;

const canvas = ref<HTMLCanvasElement>();

const pane = useTweakpane();
const { addCamera, addSizable } = useThree(canvas);
const { x, y, elementWidth, elementHeight } = useMouseInElement(canvas);
const mouseCoords = reactiveComputed(() => ({
  x: (x.value / elementWidth.value - 0.5) * 2,
  y: (y.value / elementHeight.value - 0.5) * -2,
}));

onMounted(async () => {
  // const loaderManager = new THREE.LoadingManager();
  // const textureLoader = new THREE.TextureLoader(loaderManager);
  // const cubeTextureLoader = new THREE.CubeTextureLoader(loaderManager);
  // const fontLoader = new STDLIB.FontLoader(loaderManager);

  const scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(9999);
  axesHelper.visible = false;
  scene.add(axesHelper);

  const paneFolderAxesHelper = pane.value?.addFolder({
    title: "axesHelper",
    expanded: false,
  });
  paneFolderAxesHelper?.addInput(axesHelper, "visible");

  const ambientLight = new THREE.AmbientLight(_, 0.1);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight();
  pointLight.position.set(4, 2, 4);
  scene.add(pointLight);

  const obj1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#f00" })
  );
  obj1.position.set(-2, 0, 0);
  scene.add(obj1);

  const obj2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#f00" })
  );
  scene.add(obj2);

  const obj3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#f00" })
  );
  obj3.position.set(2, 0, 0);
  scene.add(obj3);

  const raycaster = new THREE.Raycaster();

  const camera = addCamera(new THREE.PerspectiveCamera(60));
  camera.position.set(0, 0, 4);
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

  const clock = new THREE.Clock();

  useRafFn(() => {
    controls.update();

    const elapsedTime = clock.getElapsedTime();

    obj1.position.setY(Math.sin(elapsedTime));
    obj2.position.setY(Math.sin(elapsedTime + Math.PI / 4));
    obj3.position.setY(Math.sin(elapsedTime + Math.PI / 2));

    raycaster.setFromCamera(mouseCoords, camera);

    const targetObjects = [obj1, obj2, obj3];
    const intersections =
      raycaster.intersectObjects<typeof targetObjects[number]>(targetObjects);

    for (const targetObject of targetObjects)
      targetObject.material.color.set("#f00");

    for (const intersection of intersections)
      intersection.object.material.color.set("#00f");

    renderer.render(scene, camera);
  });
});
</script>

<template>
  <div class="w-full h-screen">
    <canvas ref="canvas" class="w-full h-full block" />
  </div>
</template>
