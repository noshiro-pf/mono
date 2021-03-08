import { PromiseStatus } from '@noshiro/ts-utils';

export type PromiseSnackbarStateType = {
  isOpen: boolean;
  message: string;
  promiseState: PromiseStatus;
};
