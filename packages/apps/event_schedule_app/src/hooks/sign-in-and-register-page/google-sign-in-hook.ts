import { GoogleSignInStore, router } from '../../store';

export const useGoogleSignInState = (): Readonly<{
  googleSignInButtonDisabled: boolean;
  googleSignInClickHandler: () => void;
}> => {
  const googleSignInButtonDisabled = useObservableValue(
    GoogleSignInStore.googleSignInButtonDisabled$
  );

  const pageToBack = useObservableValue(router.pageToBack$);

  const googleSignInClickHandler = useCallback(() => {
    if (googleSignInButtonDisabled) return;

    GoogleSignInStore.googleSignInSubmit(pageToBack).catch(console.error);
  }, [googleSignInButtonDisabled, pageToBack]);

  return {
    googleSignInButtonDisabled,
    googleSignInClickHandler,
  };
};
