import { toClassName } from '../../../../utils';
import { SliderLabelStyled } from './slider-label-styled';

type Props = Readonly<{
  handleElementRef: React.RefObject<HTMLSpanElement>;
  direction: 'left' | 'right';
  style: React.CSSProperties;
  disabled: boolean;
  tabIndex?: number;
  label: string;
  beginHandleMovement: React.MouseEventHandler<HTMLSpanElement>;
  beginHandleTouchMovement: React.TouchEventHandler<HTMLSpanElement>;
  handleKeyDown: React.KeyboardEventHandler<HTMLSpanElement>;
  handleKeyUp: React.KeyboardEventHandler<HTMLSpanElement>;
}>;

export const SliderHandle = memoNamed<Props>(
  'SliderHandle',
  ({
    handleElementRef,
    direction,
    style,
    disabled,
    tabIndex,
    label,
    handleKeyDown,
    handleKeyUp,
    beginHandleMovement,
    beginHandleTouchMovement,
  }) => (
    <SliderHandleStyled
      ref={handleElementRef}
      // eslint-disable-next-line react/forbid-component-props
      className={toClassName({
        disabled,
        left: direction === 'left',
        right: direction === 'right',
      })}
      style={style}
      tabIndex={tabIndex}
      onKeyDown={disabled ? undefined : handleKeyDown}
      onKeyUp={disabled ? undefined : handleKeyUp}
      onMouseDown={disabled ? undefined : beginHandleMovement}
      onTouchStart={disabled ? undefined : beginHandleTouchMovement}
    >
      <SliderHandleLabelStyled
        // eslint-disable-next-line react/forbid-component-props
        className={toClassName({
          disabled,
          right: direction === 'right',
        })}
      >
        {label}
      </SliderHandleLabelStyled>
    </SliderHandleStyled>
  ),
);

const SliderHandleStyled = styled.span`
  position: absolute;
  left: 0;
  top: 0;
  height: 16px;
  width: 16px;
  background-color: #f6f7f9;
  color: #1c2127;
  border-radius: 2px;
  box-shadow:
    0 0 0 1px rgba(17, 20, 24, 0.5),
    0 1px 1px rgba(17, 20, 24, 0.5);
  cursor: pointer;

  &:hover {
    background-clip: padding-box;
    background-color: #edeff2;
    box-shadow:
      inset 0 0 0 1px rgba(17, 20, 24, 0.2),
      0 1px 2px rgba(17, 20, 24, 0.2);
  }

  &:active,
  &.active {
    background-color: #dce0e5;
    box-shadow:
      inset 0 0 0 1px rgba(17, 20, 24, 0.2),
      0 1px 2px rgba(17, 20, 24, 0.2);
  }

  &:disabled,
  &.disabled {
    background-color: rgba(211, 216, 222, 0.5);
    box-shadow: none;
    color: rgba(95, 107, 124, 0.6);
    cursor: not-allowed;
    outline: none;
  }

  &:disabled.active,
  &:disabled.active:hover,
  &.disabled.active,
  &.disabled.active:hover,
  &:disabled:active,
  &:disabled:active:hover,
  &.disabled:active,
  &.disabled:active:hover {
    background: rgba(211, 216, 222, 0.7);
  }

  &:focus {
    z-index: 1;
  }

  &:hover {
    background-clip: padding-box;
    background-color: #edeff2;
    box-shadow:
      0 0 0 1px rgba(17, 20, 24, 0.5),
      0 1px 2px rgba(17, 20, 24, 0.6);
    cursor: grab;
    z-index: 2;
  }

  &:active,
  &.active {
    background-color: #dce0e5;
    box-shadow:
      inset 0 1px 1px rgba(17, 20, 24, 0.1),
      0 0 0 1px rgba(17, 20, 24, 0.5),
      0 1px 2px rgba(17, 20, 24, 0.2);
    cursor: grabbing;
  }

  &.disabled {
    background: #c5cbd3;
    box-shadow: none;
    pointer-events: none;
  }

  &.left,
  &.right {
    width: 8px;
  }

  &.left {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  &.right {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    margin-left: 8px;
  }
`;

const SliderHandleLabelStyled = styled(SliderLabelStyled)`
  background: #404854;
  border-radius: 2px;
  box-shadow:
    0 0 0 1px rgba(17, 20, 24, 0.1),
    0 2px 4px rgba(17, 20, 24, 0.2),
    0 8px 24px rgba(17, 20, 24, 0.2);
  color: #f6f7f9;
  margin-left: 8px;

  &.disabled {
    box-shadow: none;
  }

  &.right {
    margin-left: 0;
  }
`;
