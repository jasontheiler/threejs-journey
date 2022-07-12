import { Pane } from "tweakpane";
import * as Essentials from "@tweakpane/plugin-essentials";

export const useTweakpane = (
  config?: ConstructorParameters<typeof Pane>[0]
) => {
  const pane = ref<Pane>();

  tryOnMounted(() => {
    pane.value = new Pane(config);
    pane.value.registerPlugin(Essentials);
  });
  tryOnScopeDispose(() => pane.value?.dispose());

  return pane;
};
