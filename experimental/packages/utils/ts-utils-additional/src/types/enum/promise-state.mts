export type PromisePending = 'pending';
export type PromiseError = 'error';
export type PromiseSuccess = 'success';

export type PromiseSettled = PromiseError | PromiseSuccess;

export type PromiseStatus = PromisePending | PromiseSettled;

export const promiseStatus: Readonly<{
  pending: PromisePending;
  error: PromiseError;
  success: PromiseSuccess;
}> = {
  pending: 'pending',
  error: 'error',
  success: 'success',
};
