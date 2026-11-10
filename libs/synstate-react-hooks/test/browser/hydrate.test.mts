import { act } from '@testing-library/react';
import * as React from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { source } from 'synstate';
import { useObservableValue } from '../../src/index.mjs';

describe('hydrating server-rendered markup', () => {
  test('takes over the markup without a mismatch and follows later emissions', () => {
    const count$ = source<number>(3);

    const Count = (): React.ReactNode => {
      const count = useObservableValue(count$);

      return React.createElement('span', undefined, count);
    };

    const container = document.createElement('div');

    const parser = new DOMParser();

    const serverMarkup = parser.parseFromString(
      renderToString(React.createElement(Count)),
      'text/html',
    );

    container.append(...serverMarkup.body.childNodes);

    document.body.append(container);

    const serverSpan = container.firstChild;

    const mut_recoverableErrors: unknown[] = [];

    let mut_root: Root | undefined = undefined;

    try {
      act(() => {
        mut_root = hydrateRoot(container, React.createElement(Count), {
          onRecoverableError: (error) => {
            mut_recoverableErrors.push(error);
          },
        });
      });

      assert.deepStrictEqual(mut_recoverableErrors, []);

      // The node the server drew is kept, not replaced by a client render.
      assert.strictEqual(container.firstChild, serverSpan);

      assert.strictEqual(container.getHTML(), '<span>3</span>');

      act(() => {
        count$.next(4);
      });

      assert.strictEqual(container.getHTML(), '<span>4</span>');
    } finally {
      act(() => {
        mut_root?.unmount();
      });

      container.remove();
    }
  });
});
