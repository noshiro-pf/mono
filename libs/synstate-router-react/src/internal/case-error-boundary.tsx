import * as React from 'react';
import type { CaseErrorProps } from '../routes-props.mjs';

type Props = Readonly<{
  /** Drawn in place of `children` once they throw while rendering. */
  error: (props: CaseErrorProps) => React.ReactNode;
  /**
   * The values the case is drawn with: new ones (other params, another search)
   * clear a caught error, so that leaving the broken page clears it.
   */
  resetKey: unknown;
  children: React.ReactNode;
}>;

/**
 * Catches what a case throws while rendering. `retry` mounts the boundary
 * again, which draws the case again.
 */
// eslint-disable-next-line react-coding-style/require-react-memo -- `children` are new elements on every render of `Routes`, so a memo would compare and draw anyway
export const CaseErrorBoundary = ({
  error,
  resetKey,
  children,
}: Props): React.JSX.Element => {
  const [attempt, setAttempt] = React.useState(0);

  const retry = React.useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  return (
    <Boundary key={attempt} error={error} resetKey={resetKey} retry={retry}>
      {children}
    </Boundary>
  );
};

type BoundaryProps = Props & Readonly<{ retry: () => void }>;

type BoundaryState = Readonly<{
  caught: Readonly<{ error: unknown }> | undefined;
  resetKey: unknown;
}>;

/* eslint-disable functional/no-class-inheritance, react/require-optimization -- an error boundary is a class: React has no hook for `getDerivedStateFromError`. It keeps no state but what React gives it, and sets none itself */
class Boundary extends React.Component<BoundaryProps, BoundaryState> {
  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { caught: { error } };
  }

  static getDerivedStateFromProps(
    props: BoundaryProps,
    state: BoundaryState,
  ): Partial<BoundaryState> | null {
    // Other values: the page the error was caught on is left.
    return props.resetKey === state.resetKey
      ? null
      : { caught: undefined, resetKey: props.resetKey };
  }

  constructor(props: BoundaryProps) {
    super(props);

    this.state = { caught: undefined, resetKey: props.resetKey };
  }

  override render(): React.ReactNode {
    const { caught } = this.state;

    const { children, error, retry } = this.props;

    return caught === undefined
      ? children
      : error({ error: caught.error, retry });
  }
}
/* eslint-enable functional/no-class-inheritance, react/require-optimization */
