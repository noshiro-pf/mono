import { act, render } from '@testing-library/react-12';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { source } from 'synstate';
import { useObservableValue } from '../../src/index.mjs';

// `test/browser/hydrate.test.mts` on React 16.8 and 17, which hydrate through
// `ReactDOM.hydrate` and report a mismatch as a `console.error` warning rather
// than to `onRecoverableError`. Run by the browser projects on those versions
// alone (`configs/vitest.config.mts`).
describe('hydrating server-rendered markup before React 18', () => {
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

    // eslint-disable-next-line vitest/no-restricted-vi-methods -- a mismatch is reported only there before React 18
    const consoleError = vi.spyOn(console, 'error');

    // Unmounted, and the container removed, by the library's cleanup after the
    // test.
    render(React.createElement(Count), { container, hydrate: true });

    assert.deepStrictEqual(consoleError.mock.calls, []);

    // The node the server drew is kept, not replaced by a client render.
    assert.strictEqual(container.firstChild, serverSpan);

    // Before React 18, `renderToString` marks the root element.
    assert.strictEqual(container.getHTML(), '<span data-reactroot="">3</span>');

    act(() => {
      count$.next(4);
    });

    assert.strictEqual(container.getHTML(), '<span data-reactroot="">4</span>');
  });
});
