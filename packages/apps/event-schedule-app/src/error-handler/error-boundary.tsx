/* eslint-disable react/no-set-state */
/* eslint-disable react/destructuring-assignment */

import {
  Button,
  Classes,
  FormGroup,
  Label,
  NonIdealState,
  Pre,
} from '@blueprintjs/core';
import { Component } from 'react';
import { api } from '../api';
import {
  BpTextArea,
  ButtonsWrapperAlignEnd,
  DialogWithMaxWidth,
} from '../components';
import { isProduction } from '../env';
import { createToaster, showToast } from '../functions';

if (isProduction) {
  // eslint-disable-next-line no-restricted-syntax
  (window.onerror as Writable<typeof window.onerror>) = (e: unknown) => {
    const errorString = Result.unwrapThrow(Json.stringify(e));
    console.error(errorString);

    api.sendReport({ error: errorString }).catch(console.error);
  };
}

type State = Readonly<{
  error: unknown;
  errorInfo: unknown;
  hasError: boolean;
  isOpen: boolean;
  loading: boolean;
  description: string;
  openedOnce: boolean;
}>;

type Props = Readonly<{
  children?: React.ReactNode;
}>;

// eslint-disable-next-line react/require-optimization
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: unknown): State {
    // Update state so the next render will show the fallback UI.
    return {
      error,
      errorInfo: undefined,
      hasError: true,
      isOpen: false,
      loading: false,
      description: '',
      openedOnce: false,
    };
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  constructor(props: Props) {
    super(props);
    this.state = {
      error: undefined,
      errorInfo: undefined,
      hasError: false,
      isOpen: false,
      loading: false,
      description: '',
      openedOnce: false,
    };
  }

  override componentDidCatch(error: unknown, errorInfo: unknown): void {
    // You can also log error messages to an error reporting service here

    this.setState((prev) => ({
      error,
      errorInfo,
      hasError: true,
      isOpen: prev.isOpen,
      loading: prev.loading,
      description: prev.description,
      openedOnce: prev.openedOnce,
    }));
  }

  private readonly handleOpenClick = (): void => {
    this.setState({ isOpen: true, openedOnce: true });
  };

  private readonly handleCloseClick = (): void => {
    this.setState({ isOpen: false });
  };

  private readonly handleSendReportClick = (): void => {
    this.setState({ loading: true });

    api
      .sendReport({
        error: Result.unwrapThrow(
          Json.stringify({
            error: Str.from(this.state.error),
            errorInfo: this.state.errorInfo,
            description: this.state.description,
          }),
        ),
      })
      .then((res) => {
        this.setState({ loading: false, isOpen: false });

        if (Result.isErr(res)) {
          showToast({
            toast,
            intent: 'danger',
            message: (
              <div>
                <span>{dc.sendReport.error}</span>
                <span>{res.value.message}</span>
              </div>
            ),
          });
        } else {
          showToast({
            toast,
            intent: 'success',
            message: dc.sendReport.success,
          });
        }
      })
      .catch(console.error);
  };

  private readonly onDescriptionChange = (value: string): void => {
    this.setState({ description: value });
  };

  // eslint-disable-next-line react/no-unused-class-component-methods, @typescript-eslint/class-methods-use-this, @typescript-eslint/prefer-readonly-parameter-types
  readonly onUnhandledRejection = (ev: PromiseRejectionEvent): void => {
    ev.promise.catch((error) => {
      showErrorToast(Str.from(error));
    });
  };

  override render(): React.ReactNode {
    const {
      error,
      errorInfo,
      hasError,
      isOpen,
      loading,
      description,
      openedOnce,
    } = this.state;

    // just render children
    return !hasError ? (
      this.props.children
    ) : (
      <div
        css={css`
          height: 100vh;
        `}
      >
        <NonIdealState
          action={
            <Button onClick={this.handleOpenClick}>
              {isOpen ? dc.hideDetails : dc.showDetails}
            </Button>
          }
          description={
            <div>
              <div>{dc.unexpectedError}</div>
              {openedOnce ? <div>{dc.reloadThisPage}</div> : undefined}
            </div>
          }
          icon={'error'}
        />
        <DialogWithMaxWidth isOpen={isOpen} onClose={this.handleCloseClick}>
          <div className={Classes.DIALOG_BODY}>
            <Label>
              {dc.sendReport.log}
              <Pre
                css={css`
                  max-height: 200px;
                  overflow-y: auto;
                `}
              >
                {Str.from(error)}
                {isRecord(errorInfo) &&
                Object.hasOwn(errorInfo, 'componentStack') &&
                isString(errorInfo.componentStack)
                  ? errorInfo.componentStack
                  : undefined}
              </Pre>
            </Label>

            <FormGroup
              helperText={dc.sendReport.description.helperText}
              label={dc.sendReport.description.label}
              labelFor='description-textarea'
              labelInfo={dc.sendReport.description.labelInfo}
            >
              <BpTextArea
                fill={true}
                id={'description-textarea'}
                intent={'primary'}
                maxLength={500}
                rows={6}
                value={description}
                onValueChange={this.onDescriptionChange}
              />
            </FormGroup>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <ButtonsWrapperAlignEnd>
              <Button intent={'none'} onClick={this.handleCloseClick}>
                {dict.common.buttonText.close}
              </Button>
              <Button
                intent={'primary'}
                loading={loading}
                onClick={this.handleSendReportClick}
              >
                {dc.sendReport.button}
              </Button>
            </ButtonsWrapperAlignEnd>
          </div>
        </DialogWithMaxWidth>
      </div>
    );
  }
}

/**
 * @link https://www.asobou.co.jp/blog/web/error-boundary
 * @link https://ja.reactjs.org/docs/error-boundaries.html
 */

const dc = dict.errorMessages.errorHandler;

const toast = createToaster();

const showErrorToast = (error: DeepReadonly<React.ReactNode>): void => {
  showToast({
    toast,
    intent: 'danger',
    message: error,
  });
};
