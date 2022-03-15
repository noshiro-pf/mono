/* eslint-disable @typescript-eslint/method-signature-style */
import type { Intent, IToaster } from '@blueprintjs/core';
import { Toaster } from '@blueprintjs/core';

export const createToaster = (): IToaster =>
  Toaster.create({ canEscapeKeyClear: true, position: 'top' });

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
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
    intent,
    message,
    icon: intent === 'success' ? 'tick' : undefined,
  });
};
