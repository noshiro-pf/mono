import type { Bindable, Child, JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  /** The `<caption>`, `<thead>` and `<tbody>`. */
  children: Child;
  /** Lines between the cells (`bp6-html-table-bordered`). */
  bordered?: boolean;
  /** Less padding (`bp6-compact`). */
  compact?: boolean;
  /** Every other row shaded (`bp6-html-table-striped`). */
  striped?: boolean;
  /** Rows highlighted under the pointer (`bp6-interactive`). */
  interactive?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
  'aria-label'?: Bindable<string>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/** Blueprint's `HTMLTable`: a `<table>` in Blueprint's styles. */
export const HtmlTable = ({
  children,
  bordered = false,
  compact = false,
  striped = false,
  interactive = false,
  class: className,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <table
    aria-label={ariaLabel}
    class={classObject([
      'bp6-html-table',
      bordered && 'bp6-html-table-bordered',
      compact && 'bp6-compact',
      striped && 'bp6-html-table-striped',
      interactive && 'bp6-interactive',
      className,
    ])}
    data-e2e={e2e}
  >
    {children}
  </table>
);
