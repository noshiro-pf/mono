import { createBooleanState } from 'synstate';
import { constant, If, Portal, type JSX } from 'synstate-dom';

export const DialogDemo = (): JSX.Element => {
  const [open$, { setTrue: open, setFalse: close }] = createBooleanState(false);

  return (
    <section>
      <h2>{constant('Dialog')}</h2>
      <button
        type={constant('button')}
        data-e2e={constant('dialog-open')}
        onClick={open}
      >
        {constant('Open dialog')}
      </button>
      <If
        cond={open$}
        then={
          // Mounted into `document.body`, outside this section, and removed
          // when the branch closes.
          <Portal>
            <div class={constant('overlay')}>
              <div
                class={constant('dialog')}
                role={constant('dialog')}
                aria-modal={constant('true')}
                data-e2e={constant('dialog')}
              >
                <p>{constant('This dialog is rendered through a Portal.')}</p>
                <button
                  type={constant('button')}
                  data-e2e={constant('dialog-close')}
                  onClick={close}
                >
                  {constant('Close')}
                </button>
              </div>
            </div>
          </Portal>
        }
      />
    </section>
  );
};
