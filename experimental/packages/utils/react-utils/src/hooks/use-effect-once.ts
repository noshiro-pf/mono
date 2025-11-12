import * as React from 'react';

export const useEffectOnce = <Deps extends React.DependencyList>(
  effect: React.EffectCallback,
  deps: Deps,
  /** 初回実行の値が準備できているかをチェックする関数（optional） */
  checkDepsAreReady: (deps: Deps) => boolean = () => true,
): void => {
  const didRun = React.useRef(false);

  React.useEffect(
    () => () => {
      didRun.current = false; // cleanup on unmount
    },
    [],
  );

  React.useEffect(
    () => {
      if (!didRun.current && checkDepsAreReady(deps)) {
        didRun.current = true;
        effect();
      }
    },

    // eslint-disable-next-line react-hooks/rule-suppression
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deps],
  );
};
