import { Icon, IconSize } from '@blueprintjs/core';
import {
  higherContrastTextColorHsl,
  hslToStr,
  type Hsl,
} from '@noshiro/ts-utils-additional';
import {
  LabelButtonItemBodyDisabledStyled,
  LabelButtonItemBodyStyled,
} from './label-button-item-main-styled';
import { LabelButtonText } from './label-button-item-text-styled';

type Props = Readonly<{
  index: SafeUint;
  hsl: Hsl;
  isSelected: boolean;
  labelText: string;
  isVisible: boolean;
  disabled?: boolean;
  onLabelClick: () => void;
  onVisibilityIconClick: (ev: React.BaseSyntheticEvent) => void;
}>;

export const LabelButtonItemView = memoNamed<Props>(
  'LabelButtonItemView',
  (props) => {
    const disabled = props.disabled ?? false;

    const buttonBgStyle = useMemo<React.CSSProperties>(
      () => ({
        backgroundColor: hslToStr(props.hsl),
        color: higherContrastTextColorHsl(props.hsl),
      }),
      [props.hsl],
    );

    const buttonBgStyleConditional = useMemo<React.CSSProperties>(
      () => (disabled ? {} : buttonBgStyle),
      [disabled, buttonBgStyle],
    );

    const isSelectedIconStyle = useMemo<React.CSSProperties>(
      () => ({
        color: props.isSelected
          ? higherContrastTextColorHsl(props.hsl)
          : hslToStr(props.hsl),
      }),
      [props.isSelected, props.hsl],
    );

    const LabelButtonItemBodyComponentConditional = useMemo(
      () =>
        disabled
          ? LabelButtonItemBodyDisabledStyled
          : LabelButtonItemBodyStyled,
      [disabled],
    );

    const onLabelClickConditional = useCallback(() => {
      if (disabled) return;
      props.onLabelClick();
    }, [disabled, props]);

    const onVisibilityIconClickConditional = useCallback(
      (ev: React.BaseSyntheticEvent) => {
        if (disabled) return;
        props.onVisibilityIconClick(ev);
      },
      [disabled, props],
    );

    return (
      <div
        css={css`
          padding-bottom: 5px;
        `}
      >
        <LabelButtonItemBodyComponentConditional
          style={buttonBgStyleConditional}
          onClick={onLabelClickConditional}
        >
          <Icon icon={'tick'} style={isSelectedIconStyle} />
          <LabelButtonText>{props.labelText}</LabelButtonText>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            css={disabled ? iconWrapperStyle : iconButtonWrapperStyle}
            onClick={onVisibilityIconClickConditional}
          >
            <Icon
              icon={props.isVisible ? 'eye-open' : 'eye-off'}
              size={IconSize.LARGE}
            />
          </div>
        </LabelButtonItemBodyComponentConditional>
      </div>
    );
  },
);

const iconWrapperStyle = css`
  height: 30px;
  width: 40px;
  border-radius: 20px;
  flex-basis: 40px;
  flex-grow: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const iconButtonWrapperStyle = css`
  ${iconWrapperStyle}
  &:hover {
    opacity: 0.5;
  }
`;
