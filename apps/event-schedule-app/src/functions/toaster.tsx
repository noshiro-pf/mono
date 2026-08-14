import { OverlayToaster, type OverlayToasterProps } from '@blueprintjs/core';
import { createRoot } from 'react-dom/client';
import { match } from '../utils-ported/index.mjs';

// export const createToaster = (): IToaster =>
//   Toaster.create({ canEscapeKeyClear: true, position: 'top' });

const callback =
  (
    // Both signatures are dictated from outside: `resolve` is the one the
    // `Promise` constructor hands over, and the callback below is what
    // `OverlayToaster.create`'s ref parameter is called with.
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    resolve: (value: OverlayToaster | PromiseLike<OverlayToaster>) => void,
    reject: (reason?: unknown) => void,
  ) =>
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  (instance: OverlayToaster | null) => {
    if (instance === null) {
      reject(new Error('[Blueprint] Unable to create toaster.'));
    } else {
      resolve(instance);
    }
  };

export const createToaster = (
  // `Readonly`, not `DeepReadonly`: these props carry `ReactNode`, and a
  // deeply-readonly `ReactNode` is no longer a `ReactNode`.
  props?: Readonly<OverlayToasterProps>,
  container = document.body,
): Promise<OverlayToaster> => {
  const containerElement = document.createElement('div');

  container.append(containerElement);

  const root = createRoot(containerElement);

  return new Promise<OverlayToaster>((resolve, reject) => {
    root.render(
      <OverlayToaster
        canEscapeKeyClear
        position={'top'}
        usePortal={false}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={callback(resolve, reject)}
      />,
    );
  });
};

export const showToast = ({
  isCloseButtonShown = true,
  toast,
  message,
  intent,
  icon,
}: Readonly<{
  isCloseButtonShown?: boolean;
  toast: Promise<Toaster>;
  message: React.ReactNode;
  intent: Intent;
  icon?: IconName;
}>): void => {
  toast
    .then((t) =>
      t.show({
        isCloseButtonShown,
        timeout: intent === 'danger' || intent === 'warning' ? 0 : 2000,
        intent,
        message,
        icon:
          icon ??
          match<Intent, IconName | undefined>(intent, {
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
