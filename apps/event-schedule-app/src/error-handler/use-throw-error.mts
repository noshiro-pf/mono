import * as React from 'react';

/** @link https://github.com/facebook/react/issues/14981#issuecomment-468460187 */
export const useThrowError = (): ((errorMessage: string) => void) => {
  const [_, dummySetState] = React.useState(() => {});

  const throwError = React.useCallback((errorMessage: string) => {
    dummySetState(() => {
      throw new Error(errorMessage);
    });
  }, []);

  return throwError;
};
