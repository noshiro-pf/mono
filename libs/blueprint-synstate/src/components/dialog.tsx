import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import { classObject, uniqueId } from '../internal/index.mjs';
import { Button } from './button.js';
import { Icon, type IconName } from './icon.js';
import { Overlay } from './overlay-parts.js';

type Props = Readonly<{
  isOpen: Bindable<boolean>;
  /** Asked for by the close button, Escape and a press on the backdrop. */
  onClose?: (event: Event) => void;
  /** In the header, an `<h2>`; with none there is no header. */
  title?: Bindable<string>;
  /** Before the title. */
  icon?: IconName;
  /** The × at the end of the header; on by default, as Blueprint's. */
  isCloseButtonShown?: boolean;
  /** Escape asks to close; on by default. */
  canEscapeKeyClose?: boolean;
  /** A press on the backdrop asks to close; on by default. */
  canOutsideClickClose?: boolean;
  /** `alertdialog` for an `Alert`. */
  role?: 'alertdialog' | 'dialog';
  /** Usually `div.bp6-dialog-body` and `div.bp6-dialog-footer`. */
  children: Child;
  /** Classes on `div.bp6-dialog`, after Blueprint's own. */
  class?: string;
  'data-e2e'?: string;
}>;

/**
 * Blueprint's `Dialog`: `div.bp6-dialog` with a header, over a backdrop, in a
 * portal at the end of the body. Focus is brought inside as it opens, to an
 * element with `autoFocus` if there is one, kept inside while it is open, and
 * given back as it closes.
 */
export const Dialog = ({
  isOpen,
  onClose,
  title,
  icon,
  isCloseButtonShown = true,
  canEscapeKeyClose = true,
  canOutsideClickClose = true,
  role = 'dialog',
  children,
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  const titleId = `title-${uniqueId('bp-dialog')}` as const;

  return (
    <Overlay
      canEscapeKeyClose={canEscapeKeyClose}
      canOutsideClickClose={canOutsideClickClose}
      class={'bp6-overlay-scroll-container'}
      content={({ class: contentClass, tabIndex }) => (
        <div
          class={{ 'bp6-dialog-container': constant(true), ...contentClass }}
          tabIndex={tabIndex === undefined ? undefined : constant(tabIndex)}
        >
          <div
            aria-labelledby={
              title === undefined ? undefined : constant(titleId)
            }
            aria-modal={constant('true')}
            class={classObject(['bp6-dialog', className])}
            data-e2e={e2e === undefined ? undefined : constant(e2e)}
            role={constant(role)}
          >
            {title === undefined ? (
              []
            ) : (
              <div class={constant('bp6-dialog-header')}>
                {icon === undefined ? [] : <Icon icon={icon} />}
                <h2 class={constant('bp6-heading')} id={constant(titleId)}>
                  {title}
                </h2>
                {isCloseButtonShown ? (
                  <Button
                    aria-label={constant('Close')}
                    class={'bp6-dialog-close-button'}
                    icon={'small-cross'}
                    variant={constant('minimal')}
                    onClick={(event) => {
                      onClose?.(event);
                    }}
                  />
                ) : (
                  []
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      )}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};
