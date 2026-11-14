import {
  Button,
  Dialog,
  FormGroup,
  Label,
  NonIdealState,
  TextArea,
} from 'blueprint-synstate';
import {
  createBooleanState,
  createScope,
  createState,
  getCurrentScope,
} from 'synstate';
import { constant, If, mapBindable, mountable, type JSX } from 'synstate-dom';
import { Json, Optional, Result, unknownToString } from 'ts-data-forge';
import {
  ButtonsWrapperAlignEnd,
  maxWidthModalClass,
} from '../components/index.mjs';
import { dict } from '../constants/index.mjs';
import { isProduction } from '../env.mjs';
import { showToast } from '../functions/index.mjs';
import { api, toaster } from '../store/index.mjs';
import * as styles from './error-boundary.module.css';
import { createUncaughtErrorReporter } from './report-uncaught.mjs';

if (isProduction) {
  // The directory of the chunk this module is built into, where the build puts
  // every chunk of the page: Vite's `build.assetsDir`, which the app leaves at
  // its default. A chunk written anywhere else would have its errors dropped.
  const chunkDirectory = new URL('.', import.meta.url);

  const reporter = createUncaughtErrorReporter({
    sendReport: api.sendReport,
    ownScripts: chunkDirectory.href,
  });

  addEventListener('error', reporter.onError);

  addEventListener('unhandledrejection', reporter.onUnhandledRejection);
}

type Props = Readonly<{ children: JSX.Element }>;

/**
 * Draws `children`, or, if drawing it throws, the error screen in its place,
 * from which the error can be reported: what React's error boundary did for a
 * render. An error thrown later, by an update, is left to the reporter above.
 *
 * @link https://www.asobou.co.jp/blog/web/error-boundary
 */
export const ErrorBoundary = ({ children }: Props): JSX.Element =>
  // A component runs as it is mounted, so that is what is guarded. In a scope
  // of its own, so that what the part drawn before the throw set up (its
  // subscriptions, its requests) is stopped with it, not left behind the error
  // screen.
  mountable(() => {
    const scope = createScope(getCurrentScope());

    try {
      return scope.run(() => children.mount());
    } catch (error) {
      scope.dispose();

      console.error(error);

      return (<ErrorScreen error={error} />).mount();
    }
  });

const ErrorScreen = ({ error }: Readonly<{ error: unknown }>): JSX.Element => {
  const [isOpen$, { setTrue: open, setFalse: close }] =
    createBooleanState(false);

  const [openedOnce$, { setTrue: setOpenedOnce }] = createBooleanState(false);

  const [loading$, { setState: setLoading }] = createBooleanState(false);

  const [description$, setDescription] = createState('');

  const sendReport = (): void => {
    setLoading(true);

    api
      .sendReport({
        // `Json.stringify` yields `string | undefined` — `undefined` is what
        // `JSON.stringify` returns for a value it cannot represent.
        error:
          Result.unwrapThrow(
            Json.stringify({
              error: unknownToString(error),
              errorInfo: undefined,
              description: Optional.unwrap(description$.getSnapshot()),
            }),
          ) ?? '',
      })
      .then((res) => {
        setLoading(false);

        close();

        if (Result.isErr(res)) {
          showToast({
            toast: toaster,
            intent: 'danger',
            message: (
              <div>
                <span>{constant(dc.sendReport.error)}</span>
                <span>{constant(res.value.message)}</span>
              </div>
            ),
          });
        } else {
          showToast({
            toast: toaster,
            intent: 'success',
            message: dc.sendReport.success,
          });
        }
      })
      .catch(console.error);
  };

  return (
    <div class={constant(styles.screen)}>
      <NonIdealState
        action={
          <Button
            text={mapBindable(isOpen$, (isOpen) =>
              isOpen ? dc.hideDetails : dc.showDetails,
            )}
            onClick={() => {
              open();

              setOpenedOnce();
            }}
          />
        }
        description={
          <div>
            <div>{constant(dc.unexpectedError)}</div>
            <If
              cond={openedOnce$}
              then={<div>{constant(dc.reloadThisPage)}</div>}
            />
          </div>
        }
        icon={'error'}
      />
      <Dialog class={maxWidthModalClass} isOpen={isOpen$} onClose={close}>
        <div class={constant('bp6-dialog-body')}>
          <Label text={constant(dc.sendReport.log)}>
            <pre class={constant(`bp6-code-block ${styles.log}`)}>
              {constant(unknownToString(error))}
            </pre>
          </Label>

          <FormGroup
            helperText={constant(dc.sendReport.description.helperText)}
            label={constant(dc.sendReport.description.label)}
            labelFor={'description-textarea'}
            labelInfo={constant(dc.sendReport.description.labelInfo)}
          >
            <TextArea
              fill
              id={'description-textarea'}
              intent={'primary'}
              maxLength={500}
              rows={6}
              value={description$}
              onInput={({ currentTarget }) => {
                setDescription(currentTarget.value);
              }}
            />
          </FormGroup>
        </div>
        <div class={constant('bp6-dialog-footer')}>
          <ButtonsWrapperAlignEnd>
            <Button
              intent={'none'}
              text={constant(dict.common.buttonText.close)}
              onClick={close}
            />
            <Button
              intent={'primary'}
              loading={loading$}
              text={constant(dc.sendReport.button)}
              onClick={sendReport}
            />
          </ButtonsWrapperAlignEnd>
        </div>
      </Dialog>
    </div>
  );
};

const dc = dict.errorMessages.errorHandler;
