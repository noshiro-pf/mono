import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import { classObject, intentClass } from '../internal/index.mjs';
import { Icon, type IconName } from './icon.js';
import type { Intent } from './intent.mjs';

type Props = Readonly<{
  /** The body, after the title. */
  children?: Child;
  intent?: Intent;
  /** A heading (`h5.bp6-heading`) above the body. */
  title?: Bindable<string>;
  /**
   * The icon before the title and body; by default the one Blueprint draws
   * for the intent, and none for `none`. `false` draws none.
   */
  icon?: IconName | false;
  /** Less padding (`bp6-compact`). */
  compact?: boolean;
  /** No background (`bp6-minimal`). */
  minimal?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
  /** `alert` or `status`, for a message that should be read out. */
  role?: string;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `Callout`: a block that stands out from the text round it,
 * coloured by its intent.
 */
export const Callout = ({
  children,
  intent = 'none',
  title,
  icon,
  compact = false,
  minimal = false,
  class: className,
  role,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  const iconName = icon === false ? undefined : (icon ?? INTENT_ICONS[intent]);

  return (
    <div
      class={classObject([
        'bp6-callout',
        intentClass(intent),
        children !== undefined && 'bp6-callout-has-body-content',
        iconName !== undefined && 'bp6-callout-icon',
        compact && 'bp6-compact',
        minimal && 'bp6-minimal',
        className,
      ])}
      data-e2e={e2e}
      role={role === undefined ? undefined : constant(role)}
    >
      {iconName === undefined ? [] : <Icon icon={iconName} />}
      {title === undefined ? (
        []
      ) : (
        <h5 class={constant('bp6-heading')}>{title}</h5>
      )}
      {children ?? []}
    </div>
  );
};

const INTENT_ICONS = {
  danger: 'error',
  none: undefined,
  primary: 'info-sign',
  success: 'tick',
  warning: 'warning-sign',
} as const satisfies ReadonlyRecord<Intent, IconName | undefined>;
