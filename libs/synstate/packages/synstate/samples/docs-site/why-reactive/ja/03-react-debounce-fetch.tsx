/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable unicorn/prefer-global-this */
/* eslint-disable @stylistic/padding-line-between-statements */
// embed-sample-code-ignore-above

import * as React from 'react';

/* embed-sample-code-ignore-this-line */ const Component =
  /* embed-sample-code-ignore-this-line */ (): React.JSX.Element => {
    // React： コンポーネント内での手動デバウンス + fetch + abort
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState([]);
    const timerRef = React.useRef<number | undefined>(undefined);
    const abortRef = React.useRef<AbortController | undefined>(undefined);

    React.useEffect(() => {
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        // 前回の実行中リクエストをキャンセル
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        fetch(`/api/search?q=${query}`, { signal: controller.signal })
          .then((res) => res.json())
          .then((data) => {
            setResults(data);
          })
          .catch((error) => {
            if (error.name !== 'AbortError') throw error;
          });
      }, 300);

      return () => {
        clearTimeout(timerRef.current);
        abortRef.current?.abort(); // アンマウント時もキャンセル
      };
    }, [query]);

    // embed-sample-code-ignore-below
    // eslint-disable-next-line react-hooks/refs
    noop(query, setQuery, results, timerRef, abortRef);

    return <div />;
  };

const noop = (..._args: readonly unknown[]): void => {};

noop(Component);

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
