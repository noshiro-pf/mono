import { Toaster } from '@blueprintjs/core';

export const createToaster = (): IToaster =>
  Toaster.create({ canEscapeKeyClear: true, position: 'top' });

export const showToast = ({
  isCloseButtonShown = true,
  toast,
  message,
  intent,
  icon,
}: DeepReadonly<{
  isCloseButtonShown?: boolean;
  toast: IToaster;
  message: React.ReactNode;
  intent: Intent;
  icon?: IconName;
}>): void => {
  toast.show({
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
  });
};
