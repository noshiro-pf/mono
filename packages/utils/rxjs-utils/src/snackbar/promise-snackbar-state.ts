import type { PromiseStatus } from '@noshiro/ts-utils';

export type PromiseSnackbarStateType = Readonly<{
  isOpen: boolean;
  message: string;
  promiseState: PromiseStatus;
}>;
