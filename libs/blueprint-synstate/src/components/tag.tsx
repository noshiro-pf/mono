import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import { classObject, intentClass, sizeClass } from '../internal/index.mjs';
import { BpText } from './bp-text.js';
import { Icon, type IconName } from './icon.js';
import type { Intent, Size } from './intent.mjs';

export type TagProps = Readonly<{
  /** Its text, on one line cut short with an ellipsis unless `multiline`. */
  children: Child;
  intent?: Intent;
  size?: Size;
  /** A lighter background (`bp6-minimal`). */
  minimal?: boolean;
  /** Fully rounded ends (`bp6-round`). */
  round?: boolean;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Its text wraps rather than being cut short. */
  multiline?: boolean;
  /** Before the text. */
  icon?: IconName;
  /** After the text. */
  endIcon?: IconName;
  /** Drawn as chosen (`bp6-active`), as a `TagInput` draws the one it is on. */
  active?: Bindable<boolean>;
  /** With it, an × after the text that calls it. */
  onRemove?: (event: MouseEvent) => void;
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: string;
}>;

/**
 * Blueprint's `Tag`: `span.bp6-tag` round its text, with a remove button
 * (`button.bp6-tag-remove`) when it may be removed.
 */
export const Tag = ({
  children,
  intent = 'none',
  size = 'medium',
  minimal = false,
  round = false,
  fill = false,
  multiline = false,
  icon,
  endIcon,
  active,
  onRemove,
  class: className,
  'data-e2e': e2e,
}: TagProps): JSX.Element => (
  <span
    class={classObject(
      [
        'bp6-tag',
        intentClass(intent),
        sizeClass(size),
        fill && 'bp6-fill',
        minimal && 'bp6-minimal',
        round && 'bp6-round',
        className,
      ],
      active === undefined ? [] : [['bp6-active', active]],
    )}
    data-e2e={e2e === undefined ? undefined : constant(e2e)}
  >
    {icon === undefined ? [] : <Icon icon={icon} />}
    <BpText class={'bp6-fill'} ellipsize={!multiline} tagName={'span'}>
      {children}
    </BpText>
    {endIcon === undefined ? [] : <Icon icon={endIcon} />}
    {onRemove === undefined ? (
      []
    ) : (
      <button
        aria-label={constant('Remove tag')}
        class={constant('bp6-tag-remove')}
        type={constant('button')}
        onClick={onRemove}
      >
        {size === 'large' ? (
          <Icon icon={'small-cross'} size={20} />
        ) : (
          <Icon icon={'small-cross'} />
        )}
      </button>
    )}
  </span>
);
