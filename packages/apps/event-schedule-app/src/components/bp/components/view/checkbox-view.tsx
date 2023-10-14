type Props = DeepReadonly<{
  state: 'checked' | 'indeterminate' | 'none';
  disabled?: boolean;
  onCheck?: (checked: boolean) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}>;

export const CheckboxView = ({
  state,
  disabled = false,
  onCheck,
  onChange,
}: Props): React.JSX.Element => {
  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (ev) => {
        onCheck?.(ev.target.checked);
        onChange?.(ev);
      },
      [onCheck, onChange],
    );

  const inputRef = useRef<Writable<HTMLInputElement>>(null);

  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.indeterminate = state === 'indeterminate';
    }
  }, [state]);

  return (
    <Root>
      <input
        ref={inputRef}
        checked={state === 'checked'}
        disabled={disabled}
        type='checkbox'
        onChange={onChangeHandler}
      />
      <span />
    </Root>
  );
};

const Root = styled.label`
  /* .bp4-control */
  cursor: pointer;
  /* display: block; */
  position: relative;
  text-transform: none;

  /* custom */
  display: flex;
  align-items: center;
  justify-content: center;

  input:checked ~ span {
    background-color: #2d72d2;
    box-shadow: inset 0 0 0 1px rgba(17, 20, 24, 0.2);
    color: #fff;
  }
  &:hover input:checked ~ span {
    background-color: #215db0;
  }
  input:not(:disabled):active:checked ~ span {
    background: #184a90;
  }
  input:disabled:checked ~ span {
    background: rgba(45, 114, 210, 0.5);
    box-shadow: none;
    color: rgba(255, 255, 255, 0.6);
  }

  /* &.dark {
    input:checked ~ span {
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    &:hover input:checked ~ span {
      background-color: #215db0;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    input:not(:disabled):active:checked ~ span {
      background-color: #184a90;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    input:disabled:checked ~ span {
      background: rgba(45, 114, 210, 0.5);
      box-shadow: none;
      color: rgba(255, 255, 255, 0.6);
    }
  } */

  input {
    position: absolute;
    z-index: -1;
    left: 0;
    top: 0;
    opacity: 0;
  }

  span {
    display: inline-block;
    position: relative;
    cursor: pointer;
    user-select: none;
    width: 1em;
    height: 1em;
    background-clip: padding-box;
    background-color: transparent;
    border: none;
    box-shadow: inset 0 0 0 1px #738091;
    font-size: 16px;
    vertical-align: middle;

    &::before {
      content: '';
      display: block;
      height: 1em;
      width: 1em;
    }
  }

  &:hover span {
    background-color: rgba(143, 153, 168, 0.15);
  }

  input:not(:disabled):active ~ span {
    background: rgba(143, 153, 168, 0.3);
    box-shadow: inset 0 0 0 1px #738091;
  }
  input:disabled ~ span {
    background: rgba(143, 153, 168, 0.15);
    box-shadow: none;
    cursor: not-allowed;
  }
  input:focus ~ span {
    outline: rgba(45, 114, 210, 0.6) solid 2px;
    outline-offset: 2px;
    -moz-outline-radius: 6px;
    outline: #2d72d2 solid 2px;
  }

  input:indeterminate ~ span {
    background-color: #2d72d2;
    box-shadow: inset 0 0 0 1px rgba(17, 20, 24, 0.2);
    color: #fff;
  }
  &:hover input:indeterminate ~ span {
    background-color: #215db0;
  }
  input:not(:disabled):active:indeterminate ~ span {
    background: #184a90;
  }
  input:disabled:indeterminate ~ span {
    background: rgba(45, 114, 210, 0.5);
    box-shadow: none;
    color: rgba(255, 255, 255, 0.6);
  }

  /* &.dark {
    input:indeterminate ~ span {
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    &:hover input:indeterminate ~ span {
      background-color: #215db0;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    input:not(:disabled):active:indeterminate ~ span {
      background-color: #184a90;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    input:disabled:indeterminate ~ span {
      background: rgba(45, 114, 210, 0.5);
      box-shadow: none;
      color: rgba(255, 255, 255, 0.6);
    }
  } */

  span {
    border-radius: 2px;
  }

  input:checked ~ span::before {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='white'/%3e%3c/svg%3e");
  }
  input:indeterminate ~ span::before {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M11 7H5c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1z' fill='white'/%3e%3c/svg%3e");
  }
`;
