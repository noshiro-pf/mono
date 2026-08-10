/** @link https://github.com/facebook/react/issues/14981#issuecomment-468460187 */
export const useThrowError = (): ((errorMessage: string) => void) => {
  const [_, dummySetState] = useState(noop);

  const throwError = useCallback((errorMessage: string) => {
    dummySetState(() => {
      throw new Error(errorMessage);
    });
  }, []);

  return throwError;
};
