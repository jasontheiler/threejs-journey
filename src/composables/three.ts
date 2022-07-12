import {
  type ConfigurableWindow,
  type ElementSize,
  type MaybeRef,
} from "@vueuse/core";
import * as THREE from "three";

export interface UseThreeOptions extends ConfigurableWindow {
  /**
   * Initial display size of the canvas.
   *
   * @default undefined
   */
  initialSize?: ElementSize;
  /**
   * Maximum pixel ratio to limit the size of the canvas' drawing buffer and
   * thus to safe performance on devices with high DPI displays (like
   * HiDPI/Retina displays). A maximum pixel ratio of `2` is sufficient for most
   * displays commonly used today.
   *
   * @see https://developer.mozilla.org/docs/Web/API/Window/devicePixelRatio
   * @see https://threejs.org/manual/#en/responsive#handling-hd-dpi-displays
   * @default 2
   */
  maxPixelRatio?: MaybeRef<number>;
}

export interface UseThreeReturn extends ReturnType<typeof useThree> {}

export interface Sizable {
  setSize: (width: number, height: number) => void;
}

/**
 * Reactive Three.js helper.
 *
 * @see
 * @param canvas
 * @param options
 */
export const useThree = (
  canvas: MaybeRef<HTMLCanvasElement | null | undefined>,
  options: UseThreeOptions = {}
) => {
  const { window, initialSize, maxPixelRatio = 2 } = options;

  const { width: canvasWidth, height: canvasHeight } = useElementSize(
    canvas,
    initialSize,
    { window }
  );
  const pixelRatio = useClamp(
    useDevicePixelRatio({ window }).pixelRatio,
    0,
    maxPixelRatio
  );
  const width = computed(() => canvasWidth.value * pixelRatio.value);
  const height = computed(() => canvasHeight.value * pixelRatio.value);
  const aspectRatio = computed(() => width.value / height.value || 1);

  const cameras: THREE.Camera[] = [];
  const adjustCamera = (camera: THREE.Camera) => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = aspectRatio.value;
      camera.updateProjectionMatrix();

      return;
    }

    if (camera instanceof THREE.OrthographicCamera) {
      const height = Math.abs(camera.top - camera.bottom);
      const width = height * aspectRatio.value;

      camera.left = Math.sign(camera.left) * (width / 2);
      camera.right = Math.sign(camera.right) * (width / 2);
      camera.updateProjectionMatrix();

      return;
    }

    if (camera instanceof THREE.ArrayCamera) {
      for (const innerCamera of camera.cameras) adjustCamera(innerCamera);

      return;
    }

    if (camera instanceof THREE.StereoCamera) {
      camera.aspect = aspectRatio.value;
      camera.cameraL.updateProjectionMatrix();
      camera.cameraR.updateProjectionMatrix();

      return;
    }
  };
  const adjustCameras = () => {
    for (const camera of cameras) adjustCamera(camera);
  };
  const addCamera = <T extends THREE.Camera>(camera: T) => {
    if (!cameras.includes(camera)) {
      cameras.push(camera);
      adjustCamera(camera);
    }

    return camera;
  };

  watch(aspectRatio, adjustCameras);

  const sizables: Sizable[] = [];
  const adjustSizable = (sizable: Sizable) => {
    if (
      sizable instanceof THREE.WebGLRenderer ||
      sizable instanceof THREE.WebGL1Renderer
    )
      sizable.setSize(width.value, height.value, false);
    else sizable.setSize(width.value, height.value);
  };
  const adjustSizables = () => {
    for (const sizable of sizables) adjustSizable(sizable);
  };
  const addSizable = <T extends Sizable>(sizable: T): T => {
    if (!sizables.includes(sizable)) {
      sizables.push(sizable);
      adjustSizable(sizable);
    }

    return sizable;
  };

  watch([width, height], adjustSizables);

  tryOnMounted(() => {
    adjustCameras();
    adjustSizables();
  });

  return {
    /** Display width of the canvas. */
    canvasWidth,
    /** Display height of the canvas. */
    canvasHeight,
    /** Width of the canvas' drawing buffer. */
    width,
    /** Height of the canvas' drawing buffer. */
    height,
    /** Aspect ratio of the canvas' drawing buffer. */
    aspectRatio,
    /**
     * Adds a `THREE.Camera` that should be adjusted when the aspect ratio of
     * the canvas' drawing buffer changes.
     */
    addCamera,
    /**
     * Adds an object/class with a `setSize()` function/method that should be
     * adjusted when the size of the canvas' drawing buffer changes (e.g.
     * `THREE.WebGLRenderer` or `EffectComposer`).
     */
    addSizable,
  };
};
