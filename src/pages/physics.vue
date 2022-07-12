<script lang="ts" setup>
import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
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

let intervalId: NodeJS.Timer;
let animationFrameId: number;

onMounted(async () => {
  await RAPIER.init();

  const fpsGraph = pane.value?.addBlade({
    view: "fpsgraph",
    label: "fps",
  }) as any;

  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

  const scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight(_, 0.25);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(_, 0.25);
  pointLight.castShadow = true;
  pointLight.position.set(-8, 6, 8);
  scene.add(pointLight);

  const floorColliderDesc = RAPIER.ColliderDesc.cuboid(4, 0.25, 4);
  floorColliderDesc.setTranslation(0, -0.25, 0);
  const floorCollider = world.createCollider(floorColliderDesc);
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.5, 8),
    new THREE.MeshStandardMaterial({ metalness: 0.1, roughness: 0.1 })
  );
  floorMesh.position.setY(-0.25);
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  const updates: (() => void)[] = [];
  const addUpdate = (updateFn: () => void) => updates.push(updateFn);
  const removeUpdate = (updateFn: () => void) => {
    const idx = updates.findIndex((update) => update === updateFn);
    updates.splice(idx, 1);
  };

  const createSphere = ({ r, x, y, z }: { r: number } & RAPIER.Vector) => {
    const sphereRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    sphereRigidBodyDesc.setTranslation(x, y, z);
    const sphereRigidBody = world.createRigidBody(sphereRigidBodyDesc);
    const sphereColliderDesc = RAPIER.ColliderDesc.ball(r);
    sphereColliderDesc.setRestitution(0.67);
    sphereColliderDesc.setRestitutionCombineRule(
      RAPIER.CoefficientCombineRule.Max
    );
    const sphereCollider = world.createCollider(
      sphereColliderDesc,
      sphereRigidBody
    );
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 32),
      new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.1 })
    );
    sphereMesh.castShadow = true;
    scene.add(sphereMesh);

    const update = () => {
      const { x, y, z } = sphereRigidBody.translation();

      if (y <= -50) {
        removeUpdate(update);

        world.removeCollider(sphereCollider, false);
        world.removeRigidBody(sphereRigidBody);

        scene.remove(sphereMesh);

        sphereMesh.geometry.dispose();
        sphereMesh.material.dispose();

        return;
      }

      sphereMesh.position.set(x, y, z);
      sphereMesh.setRotationFromQuaternion(sphereRigidBody.rotation() as any);
    };

    addUpdate(update);
  };

  const createBox = ({
    w,
    h,
    d,
    x,
    y,
    z,
  }: { w: number; h: number; d: number } & RAPIER.Vector) => {
    const boxRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    boxRigidBodyDesc.setTranslation(x, y, z);
    const boxRigidBody = world.createRigidBody(boxRigidBodyDesc);
    const boxColliderDesc = RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2);
    boxColliderDesc.setRestitution(0.67);
    boxColliderDesc.setRestitutionCombineRule(
      RAPIER.CoefficientCombineRule.Max
    );
    const boxCollider = world.createCollider(boxColliderDesc, boxRigidBody);
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ metalness: 0.5, roughness: 0.1 })
    );
    boxMesh.castShadow = true;
    scene.add(boxMesh);

    const update = () => {
      const { x, y, z } = boxRigidBody.translation();

      if (y <= -50) {
        removeUpdate(update);

        world.removeCollider(boxCollider, false);
        world.removeRigidBody(boxRigidBody);

        scene.remove(boxMesh);

        boxMesh.geometry.dispose();
        boxMesh.material.dispose();

        return;
      }

      boxMesh.position.set(x, y, z);
      boxMesh.setRotationFromQuaternion(boxRigidBody.rotation() as any);
    };

    addUpdate(update);
  };

  const between = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const createRandomSphere = () =>
    createSphere({
      r: between(0.125, 1),
      x: between(-4, 4),
      y: between(6, 12),
      z: between(-4, 4),
    });

  const createRandomBox = () =>
    createBox({
      w: between(0.125, 1.5),
      h: between(0.125, 1.5),
      d: between(0.125, 1.5),
      x: between(-4, 4),
      y: between(6, 12),
      z: between(-4, 4),
    });

  const params = {
    automatic: { rate: 8 },
    manual: { spheres: 50, boxes: 50 },
  };

  const updateAutomaticSpawning = (rate: number) => {
    clearInterval(intervalId);

    if (rate === 0) return;

    intervalId = setInterval(
      () => (Math.random() < 0.5 ? createRandomSphere() : createRandomBox()),
      1000 / rate
    );
  };

  const paneFolderAutomaticSpawning = pane.value?.addFolder({
    title: "automatic spawning",
  });
  paneFolderAutomaticSpawning
    ?.addInput(params.automatic, "rate", {
      min: 0,
      max: 100,
      step: 1,
    })
    .on("change", ({ value }) => updateAutomaticSpawning(value));

  updateAutomaticSpawning(params.automatic.rate);

  const paneFolderManualSpawning = pane.value?.addFolder({
    title: "manual spawning",
  });
  paneFolderManualSpawning?.addInput(params.manual, "spheres", {
    min: 1,
    max: 500,
    step: 1,
  });
  paneFolderManualSpawning?.addInput(params.manual, "boxes", {
    min: 1,
    max: 500,
    step: 1,
  });
  paneFolderManualSpawning
    ?.addButton({ title: "spawn objects" })
    .on("click", () => {
      for (let i = 0; i < params.manual.spheres; i++) createRandomSphere();
      for (let i = 0; i < params.manual.boxes; i++) createRandomBox();
    });

  const camera = addCamera(new THREE.PerspectiveCamera(60));
  camera.position.set(6, 8, 14);
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const clock = new THREE.Clock();

  const tick = () => {
    animationFrameId = requestAnimationFrame(() => {
      fpsGraph.begin();

      world.step();
      controls.update();

      for (const update of updates) update();

      renderer.render(scene, camera);

      fpsGraph.end();
      tick();
    });
  };

  tick();
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
  cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="w-full h-screen">
    <canvas ref="canvas" class="w-full h-full block" />
  </div>
</template>
