import { OperatorFunction } from 'rxjs';
import { PromiseSnackbarStateType } from './promise-snackbar-state';
export declare const toPromiseSnackbarState: <T>(timerMilliSec: number, initialStateMapFn: (value: T) => PromiseSnackbarStateType, delayedStateMapFn: (value: T) => PromiseSnackbarStateType) => OperatorFunction<T, PromiseSnackbarStateType>;
//# sourceMappingURL=to-promise-snackbar-state.d.ts.map