<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const _ = undefined;

const canvas = ref<HTMLCanvasElement>();

const { addCamera, addSizable } = useThree(canvas);

onMounted(async () => {
  const loaderManager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(loaderManager);

  const grassTextureColor = textureLoader.load("/textures/grass/color.jpg");
  const grassTextureAo = textureLoader.load(
    "/textures/grass/ambient-occlusion.jpg"
  );
  const grassTextureNormal = textureLoader.load("/textures/grass/normal.jpg");
  const grassTextureRoughness = textureLoader.load(
    "/textures/grass/roughness.jpg"
  );
  const bricksTextureColor = textureLoader.load("/textures/bricks/color.jpg");
  const bricksTextureAo = textureLoader.load(
    "/textures/bricks/ambient-occlusion.jpg"
  );
  const bricksTextureNormal = textureLoader.load("/textures/bricks/normal.jpg");
  const bricksTextureRoughness = textureLoader.load(
    "/textures/bricks/roughness.jpg"
  );
  const doorTextureColor = textureLoader.load("/textures/door/color.jpg");
  const doorTextureAlpha = textureLoader.load("/textures/door/alpha.jpg");
  const doorTextureAo = textureLoader.load(
    "/textures/door/ambient-occlusion.jpg"
  );
  const doorTextureDisplacement = textureLoader.load(
    "/textures/door/displacement.jpg"
  );
  const doorTextureNormal = textureLoader.load("/textures/door/normal.jpg");
  const doorTextureMetalness = textureLoader.load(
    "/textures/door/metalness.jpg"
  );
  const doorTextureRoughness = textureLoader.load(
    "/textures/door/roughness.jpg"
  );

  const scene = new THREE.Scene();

  const fog = new THREE.Fog("#262837", 0, 20);
  scene.fog = fog;

  const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.1);
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.1);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(256, 256);
  moonLight.shadow.camera.far = 15;
  moonLight.position.set(2, 2.5, -1);
  scene.add(moonLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
      map: grassTextureColor,
      aoMap: grassTextureAo,
      normalMap: grassTextureNormal,
      roughnessMap: grassTextureRoughness,
    })
  );
  floor.geometry.setAttribute("uv2", floor.geometry.getAttribute("uv"));
  floor.material.map!.repeat.set(32, 32);
  floor.material.map!.wrapS = THREE.RepeatWrapping;
  floor.material.map!.wrapT = THREE.RepeatWrapping;
  floor.material.aoMap!.repeat.set(32, 32);
  floor.material.aoMap!.wrapS = THREE.RepeatWrapping;
  floor.material.aoMap!.wrapT = THREE.RepeatWrapping;
  floor.material.normalMap!.repeat.set(32, 32);
  floor.material.normalMap!.wrapS = THREE.RepeatWrapping;
  floor.material.normalMap!.wrapT = THREE.RepeatWrapping;
  floor.material.roughnessMap!.repeat.set(32, 32);
  floor.material.roughnessMap!.wrapS = THREE.RepeatWrapping;
  floor.material.roughnessMap!.wrapT = THREE.RepeatWrapping;
  floor.receiveShadow = true;
  floor.rotation.set(-Math.PI / 2, 0, 0);
  scene.add(floor);

  const house = new THREE.Group();
  scene.add(house);

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
      map: bricksTextureColor,
      aoMap: bricksTextureAo,
      normalMap: bricksTextureNormal,
      roughnessMap: bricksTextureRoughness,
    })
  );
  walls.geometry.setAttribute("uv2", walls.geometry.getAttribute("uv"));
  walls.castShadow = true;
  walls.receiveShadow = true;
  walls.position.set(0, 2.5 / 2, 0);
  house.add(walls);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({ color: "#b35f45" })
  );
  roof.castShadow = true;
  roof.position.set(0, 2.5 + 1 / 2, 0);
  roof.rotation.set(0, Math.PI / 4, 0);
  house.add(roof);

  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 128, 128),
    new THREE.MeshStandardMaterial({
      map: doorTextureColor,
      transparent: true,
      alphaMap: doorTextureAlpha,
      aoMap: doorTextureAo,
      displacementMap: doorTextureDisplacement,
      displacementScale: 0.1,
      normalMap: doorTextureNormal,
      metalnessMap: doorTextureMetalness,
      roughnessMap: doorTextureRoughness,
    })
  );
  door.geometry.setAttribute("uv2", door.geometry.getAttribute("uv"));
  door.position.set(0, 2 / 2, 1.975);
  house.add(door);

  const doorLight = new THREE.PointLight("#ff7d46", _, 7);
  doorLight.castShadow = true;
  moonLight.shadow.mapSize.set(256, 256);
  moonLight.shadow.camera.far = 7;
  doorLight.position.set(0, 2.4, 2.1);
  house.add(doorLight);

  const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
  const bushMaterial = new THREE.MeshStandardMaterial({ color: "#89c854" });

  const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
  bush1.scale.set(0.5, 0.5, 0.5);
  bush1.position.set(0.8, 0.2, 2.2);
  const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
  bush2.scale.set(0.25, 0.25, 0.25);
  bush2.position.set(1.4, 0.1, 2.1);
  const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
  bush3.scale.set(0.4, 0.4, 0.4);
  bush3.position.set(-0.8, 0.1, 2.2);
  const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
  bush4.scale.set(0.15, 0.15, 0.15);
  bush4.position.set(-1, 0.05, 2.6);
  scene.add(bush1, bush2, bush3, bush4);

  const graves = new THREE.Group();
  scene.add(graves);

  const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const graveMaterial = new THREE.MeshStandardMaterial({ color: "#b2b6b1" });

  for (let i = 0; i < 75; i++) {
    const angle = Math.PI * 2 * Math.random();
    const radius = 15 * Math.random() + 4;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.castShadow = true;
    grave.position.set(Math.sin(angle) * radius, 0.3, Math.cos(angle) * radius);
    grave.rotation.set(
      0,
      (Math.PI / 4) * (Math.random() - 0.5),
      (Math.PI / 16) * (Math.random() - 0.5)
    );
    graves.add(grave);
  }

  const ghost1 = new THREE.PointLight("#ff00ff", 2, 3);
  ghost1.castShadow = true;
  ghost1.shadow.mapSize.set(256, 256);
  ghost1.shadow.camera.far = 7;
  scene.add(ghost1);
  const ghost2 = new THREE.PointLight("#00ffff", 2, 3);
  ghost2.castShadow = true;
  ghost2.shadow.mapSize.set(256, 256);
  ghost2.shadow.camera.far = 7;
  scene.add(ghost1);
  const ghost3 = new THREE.PointLight("#ffff00", 2, 3);
  ghost3.castShadow = true;
  ghost3.shadow.mapSize.set(256, 256);
  ghost3.shadow.camera.far = 7;
  scene.add(ghost1, ghost2, ghost3);

  const camera = addCamera(new THREE.PerspectiveCamera(60));
  camera.position.set(5, 5, 10);
  scene.add(camera);

  const controls = new OrbitControls(camera, canvas.value);
  controls.enablePan = false;
  controls.enableDamping = true;

  const renderer = addSizable(
    new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: true,
    })
  );
  renderer.setClearColor("#262837");
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const clock = new THREE.Clock();

  useRafFn(() => {
    const elapsedTime = clock.getElapsedTime();

    controls.update();

    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.set(
      Math.cos(ghost1Angle) * 4,
      Math.sin(elapsedTime * 3),
      Math.sin(ghost1Angle) * 4
    );

    const ghost2Angle = -elapsedTime * 0.32;
    ghost2.position.set(
      Math.cos(ghost2Angle) * 5,
      Math.sin(ghost2Angle * 4) + Math.sin(elapsedTime * 2.5),
      Math.sin(ghost2Angle) * 5
    );

    const ghost3Angle = -elapsedTime * 0.18;
    ghost3.position.set(
      Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32)),
      Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5),
      Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    );

    renderer.render(scene, camera);
  });
});
</script>

<template>
  <div class="w-full h-screen">
    <canvas ref="canvas" class="w-full h-full block" />
  </div>
</template>
