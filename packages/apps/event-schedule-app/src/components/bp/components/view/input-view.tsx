type Props = Partial<
  Readonly<{
    inputProps: Omit<
      React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >,
      | 'autoComplete'
      | 'disabled'
      | 'onBlur'
      | 'onChange'
      | 'onFocus'
      | 'ref'
      | 'type'
      | 'value'
    >;
    disabled: boolean;

    valueAsStr: string;
    onInputBlur: React.FocusEventHandler<HTMLInputElement>;
    onInputFocus: React.FocusEventHandler<HTMLInputElement>;
    onInputStringChange: (value: string) => void;
    onInputChange: React.ChangeEventHandler<HTMLInputElement>;

    fillSpace: boolean;
    selectOnFocus: boolean;
  }>
>;

export const InputView = memoNamed<Props>(
  'InputView',
  ({
    inputProps,
    disabled,

    valueAsStr,
    onInputBlur,
    onInputFocus,
    onInputStringChange,
    onInputChange,

    fillSpace,
    selectOnFocus,
  }) => {
    const inputValueChangeHandler: React.ChangeEventHandler<HTMLInputElement> =
      useCallback(
        (ev) => {
          onInputStringChange?.(ev.currentTarget.value);
          onInputChange?.(ev);
        },
        [onInputStringChange, onInputChange]
      );

    const inputRef = useRef<HTMLInputElement>(null);

    const inputFocusHandler: React.FocusEventHandler<HTMLInputElement> =
      useCallback(
        (ev) => {
          onInputFocus?.(ev);
          if (selectOnFocus === true) {
            inputRef.current?.select();
          }
        },
        [selectOnFocus, onInputFocus]
      );

    return (
      <InputControlGroup fillSpace={fillSpace}>
        <InputGroup disabled={disabled} fillSpace={fillSpace}>
          <Input
            ref={inputRef}
            autoComplete='off'
            disabled={disabled}
            type='text'
            value={valueAsStr}
            onBlur={onInputBlur}
            onChange={inputValueChangeHandler}
            onFocus={inputFocusHandler}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputProps}
          />
        </InputGroup>
      </InputControlGroup>
    );
  }
);

const defaultFocusStyle = css`
  outline: rgba(19, 124, 189, 0.6) auto 2px;
  outline-offset: 2px;
`;

const defaultFocusVisibleStyle = css`
  outline: -webkit-focus-ring-color auto 1px;
`;

type StyleProps = Readonly<{ disabled?: boolean; fillSpace?: boolean }>;

const InputControlGroup = styled.div`
  transform: translateZ(0);
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  flex-direction: row;
  -webkit-box-align: stretch;
  align-items: stretch;

  &:focus,
  &:focus-visible {
    ${defaultFocusStyle}
  }

  ${(props: StyleProps) =>
    props.fillSpace === true
      ? css`
          width: 100%;
        `
      : css``}
`;

const InputGroup = styled.div`
  -webkit-box-flex: 0;
  flex-grow: 0;
  flex-shrink: 0;

  display: block;
  position: relative;

  border-radius: 3px 0 0 3px;

  margin-right: -1px;

  &:focus {
    ${defaultFocusStyle}
  }

  &:focus-visible {
    ${defaultFocusVisibleStyle}
  }

  ${(props: StyleProps) =>
    props.disabled === true
      ? css`
          cursor: not-allowed;
        `
      : css``}

  ${(props: StyleProps) =>
    props.fillSpace === true
      ? css`
          -webkit-box-flex: 1;
          flex: 1 1 auto;
        `
      : css``}
`;

const Input = styled.input`
  font-family: inherit;
  margin: 0;

  overflow: visible;

  appearance: none;
  background: #ffffff;
  border: none;
  box-shadow: 0 0 0 0 rgb(19 124 189 / 0%), 0 0 0 0 rgb(19 124 189 / 0%),
    inset 0 0 0 1px rgb(16 22 26 / 15%), inset 0 1px 1px rgb(16 22 26 / 20%);
  color: #182026;
  font-size: 14px;
  font-weight: 400;
  height: 30px;
  line-height: 30px;
  outline: none;
  padding: 0 10px;
  transition: box-shadow 100ms cubic-bezier(0.4, 1, 0.75, 0.9),
    -webkit-box-shadow 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
  vertical-align: middle;

  border-radius: inherit;
  z-index: 2;

  position: relative;
  width: 100%;

  &:focus {
    outline-offset: 2px;
    box-shadow: 0 0 0 1px #137cbd, 0 0 0 3px rgb(19 124 189 / 30%),
      inset 0 1px 1px rgb(16 22 26 / 20%);

    border-radius: 3px;
    z-index: 14;
  }

  &:focus-visible {
    outline-offset: 0px;
  }

  ${(props: StyleProps) =>
    props.disabled === true
      ? css`
          background: rgba(206, 217, 224, 0.5);
          box-shadow: none;
          color: rgba(92, 112, 128, 0.6);
          cursor: not-allowed;
          resize: none;
          z-index: 1;
        `
      : css``}

  text-align: right;
`;
