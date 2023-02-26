import {
  Toaster,
  type IToasterProps,
  type ToastProps,
} from '@blueprintjs/core';
import { createRoot } from 'react-dom/client';

// export const createToaster = (): IToaster =>
//   Toaster.create({ canEscapeKeyClear: true, position: 'top' });

const callback =
  (
    resolve: (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      value: PromiseLike<Toaster> | Toaster
    ) => void,
    reject: (reason?: unknown) => void
  ) =>
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  (instance: Toaster | null) => {
    if (instance === null) {
      reject(new Error('[Blueprint] Unable to create toaster.'));
    } else {
      resolve(instance);
    }
  };

export const createToaster = (
  props?: DeepReadonly<IToasterProps>,
  container = document.body
): Promise<Toaster> => {
  const containerElement = document.createElement('div');

  container.append(containerElement);

  const root = createRoot(containerElement);

  return new Promise<Toaster>((resolve, reject) => {
    root.render(
      <Toaster
        canEscapeKeyClear={true}
        position={'top'}
        usePortal={false}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={callback(resolve, reject)}
      />
    );
  });
};

export const showToast = ({
  isCloseButtonShown = true,
  toast,
  message,
  intent,
  icon,
}: DeepReadonly<{
  isCloseButtonShown?: boolean;
  toast: Promise<IToaster>;
  message: React.ReactNode;
  intent: Intent;
  icon?: IconName;
}>): void => {
  toast
    .then(
      (t) =>
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
        } as unknown as ToastProps) // FIXME: Blueprint types are wrong
    )
    .catch(console.error);
};
