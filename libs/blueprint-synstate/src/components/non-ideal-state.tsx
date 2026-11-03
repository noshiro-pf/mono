import { constant, type Child, type JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';
import { Icon, type IconName20, type LargeIconSize } from './icon.js';

type Props = Readonly<{
  /** Drawn large and muted above the text. */
  icon?: IconName20;
  /** 48 by default, as Blueprint's `NonIdealStateIconSize.STANDARD`. */
  iconSize?: LargeIconSize;
  /** In an `<h4>`; leave it out for none, where Blueprint takes `''` too. */
  title?: Child;
  /**
   * Below the title: an element, drawn as it is, as Blueprint draws one. Put
   * text in a `<div>`, as Blueprint does for it.
   */
  description?: JSX.Element;
  /** Below the text: a button that leads out of the state, say. */
  action?: Child;
  /** The icon and text beside one another rather than one above the other. */
  layout?: 'horizontal' | 'vertical';
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: string;
}>;

/**
 * Blueprint's `NonIdealState`: a large muted icon, a title and an action, for a
 * page or a panel that has nothing to show.
 */
export const NonIdealState = ({
  icon,
  iconSize = 48,
  title,
  description,
  action,
  layout = 'vertical',
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <div
    class={classObject([
      'bp6-non-ideal-state',
      `bp6-non-ideal-state-${layout}`,
      className,
    ])}
    data-e2e={e2e === undefined ? undefined : constant(e2e)}
  >
    {icon === undefined ? (
      []
    ) : (
      <div
        class={constant('bp6-non-ideal-state-visual')}
        style={{
          'font-size': constant(`${iconSize.toString()}px`),
          'line-height': constant(`${iconSize.toString()}px`),
        }}
      >
        <Icon class={'bp6-icon-muted'} icon={icon} size={iconSize} />
      </div>
    )}
    {title === undefined && description === undefined ? (
      []
    ) : (
      <div class={constant('bp6-non-ideal-state-text')}>
        {title === undefined ? (
          []
        ) : (
          <h4 class={constant('bp6-heading')}>{title}</h4>
        )}
        {description ?? []}
      </div>
    )}
    {action ?? []}
  </div>
);
