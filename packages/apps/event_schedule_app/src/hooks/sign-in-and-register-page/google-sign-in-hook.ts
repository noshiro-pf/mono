import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import { useCallback } from 'react';
import { GoogleSignInStore, router } from '../../store';

export const useGoogleSignInState = (): Readonly<{
  googleSignInButtonDisabled: boolean;
  googleSignInClickHandler: () => void;
}> => {
  const googleSignInButtonDisabled = useObservableValue(
    GoogleSignInStore.googleSignInButtonDisabled$
  );

  const pageToBack = useObservableValue(router.pageToBack$);

  const googleSignInClickHandler = useCallback(async () => {
    if (googleSignInButtonDisabled) return;

    await GoogleSignInStore.googleSignInSubmit(pageToBack);
  }, [googleSignInButtonDisabled, pageToBack]);

  return {
    googleSignInButtonDisabled,
    googleSignInClickHandler,
  };
};
