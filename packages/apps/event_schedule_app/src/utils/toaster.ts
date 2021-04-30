import { Intent, IToaster, Toaster } from '@blueprintjs/core';

export const createToaster = (): IToaster =>
  Toaster.create({ canEscapeKeyClear: true, position: 'top' });

export const showToast = ({
  toast,
  message,
  intent,
}: Readonly<{
  toast: IToaster;
  message: string;
  intent: Intent;
}>): void => {
  toast.show({
    timeout: 2000,
    intent: intent,
    message: message,
    icon: intent === 'success' ? 'tick' : undefined,
  });
};
