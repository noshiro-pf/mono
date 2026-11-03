import {
  createToaster as createBlueprintToaster,
  type OverlayToasterProps,
} from 'blueprint-synstate';
import { constant, type Child } from 'synstate-dom';
import { match } from 'ts-data-forge';

/** The app's toaster, at the top of `container`; the Escape key clears it. */
export const createToaster = (
  props?: OverlayToasterProps,
  container: HTMLElement = document.body,
): Promise<Toaster> =>
  Promise.resolve(
    createBlueprintToaster(
      { canEscapeKeyClear: true, position: 'top', ...props },
      container,
    ),
  );

export const showToast = ({
  isCloseButtonShown = true,
  toast,
  message,
  intent,
  icon,
}: Readonly<{
  isCloseButtonShown?: boolean;
  toast: Promise<Toaster>;
  /** Text, or an element. */
  message: Child | string;
  intent: Intent;
  icon?: IconName;
}>): void => {
  toast
    .then((t) =>
      t.show({
        isCloseButtonShown,
        timeout: intent === 'danger' || intent === 'warning' ? 0 : 2000,
        intent,
        message: typeof message === 'string' ? constant(message) : message,
        icon:
          icon ??
          match(intent, {
            danger: 'error',
            success: 'tick',
            warning: 'warning-sign',
            primary: undefined,
            none: undefined,
          }),
      }),
    )
    .catch(console.error);
};
