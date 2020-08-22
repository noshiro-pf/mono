export declare type PromisePending = 'pending';
export declare type PromiseError = 'error';
export declare type PromiseSuccess = 'success';
export declare type PromiseSettled = PromiseError | PromiseSuccess;
export declare type PromiseState = PromisePending | PromiseSettled;
export declare const promiseState: {
    pending: PromisePending;
    error: PromiseError;
    success: PromiseSuccess;
};
//# sourceMappingURL=promise-state.d.ts.map