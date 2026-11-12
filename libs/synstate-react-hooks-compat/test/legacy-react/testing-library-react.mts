import { render, type RenderResult } from '@testing-library/react-12';
import * as React from 'react';

/**
 * `@testing-library/react` for the browser projects that run the tests on
 * React 16.8 and 17 (`configs/vitest.config.mts` aliases the name to this file
 * there). Its current major needs React 18, and the last one that supports
 * React 16 and 17, 12, has no `renderHook`, so it is added here the way the
 * current major implements it.
 */
export * from '@testing-library/react-12';

/**
 * Renders a component that calls `renderCallback`, as
 * `@testing-library/react`'s `renderHook` does: `result.current` is what the
 * last committed render returned.
 */
export const renderHook = <Result, Props>(
  renderCallback: (props: Props) => Result,
  options?: Readonly<{
    initialProps?: Props;
    wrapper?: React.JSXElementConstructor<
      Readonly<{ children: React.ReactNode }>
    >;
  }>,
): Readonly<{
  result: Readonly<{ current: Result | undefined }>;
  rerender: (props?: Props) => void;
  unmount: RenderResult['unmount'];
}> => {
  const mut_result: { current: Result | undefined } = { current: undefined };

  const TestComponent = ({
    renderCallbackProps,
  }: Readonly<{ renderCallbackProps: Props }>): null => {
    const pendingResult = renderCallback(renderCallbackProps);

    React.useEffect(() => {
      mut_result.current = pendingResult;
    });

    return null;
  };

  const element = (props: Props | undefined): React.ReactElement =>
    // `rerender()` passes no props, as `@testing-library/react`'s does.
    React.createElement(TestComponent, {
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      renderCallbackProps: props as Props,
    });

  const { rerender, unmount } = render(element(options?.initialProps), {
    wrapper: options?.wrapper,
  });

  return {
    result: mut_result,
    rerender: (props) => {
      rerender(element(props));
    },
    unmount,
  };
};
