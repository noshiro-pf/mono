/** @link https://github.com/facebook/react/issues/14981#issuecomment-468460187 */
export const useThrowError = (): ((errorMessage: string) => void) => {
  const { setState: dummySetState } = useState(noop);

  const throwError = useCallback((errorMessage: string) => {
    dummySetState(() => {
      throw new Error(errorMessage);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return throwError;
};
