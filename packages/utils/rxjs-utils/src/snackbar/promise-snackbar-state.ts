import { PromiseStatus } from '@mono/ts-utils';

export type PromiseSnackbarStateType = {
  isOpen: boolean;
  message: string;
  promiseState: PromiseStatus;
};
