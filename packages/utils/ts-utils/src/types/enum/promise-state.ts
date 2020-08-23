export type PromisePending = 'pending';
export type PromiseError = 'error';
export type PromiseSuccess = 'success';

export type PromiseSettled = PromiseError | PromiseSuccess;

export type PromiseState = PromisePending | PromiseSettled;

export const promiseState: {
  pending: PromisePending;
  error: PromiseError;
  success: PromiseSuccess;
} = {
  pending: 'pending',
  error: 'error',
  success: 'success',
};
