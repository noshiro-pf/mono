import { Icon, IconSize } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { Hsl } from '@noshiro/ts-utils-additional';
import {
  higherContrastTextColorHsl,
  hslToStr,
} from '@noshiro/ts-utils-additional';
import type { BaseSyntheticEvent, CSSProperties } from 'react';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  LabelButtonItemBodyDisabledStyled,
  LabelButtonItemBodyStyled,
} from './label-button-item-main-styled';
import { LabelButtonText } from './label-button-item-text-styled';

type Props = Readonly<{
  index: number;
  hsl: Hsl;
  isSelected: boolean;
  labelText: string;
  isVisible: boolean;
  disabled?: boolean;
  onLabelClick: () => void;
  onVisibilityIconClick: (ev: BaseSyntheticEvent) => void;
}>;

export const LabelButtonItemView = memoNamed<Props>(
  'LabelButtonItemView',
  (props) => {
    const disabled = props.disabled ?? false;

    const buttonBgStyle = useMemo<CSSProperties>(
      () => ({
        backgroundColor: hslToStr(props.hsl),
        color: higherContrastTextColorHsl(props.hsl),
      }),
      [props.hsl]
    );

    const buttonBgStyleConditional = useMemo<CSSProperties>(
      () => (disabled ? {} : buttonBgStyle),
      [disabled, buttonBgStyle]
    );

    const isSelectedIconStyle = useMemo<CSSProperties>(
      () => ({
        color: props.isSelected
          ? higherContrastTextColorHsl(props.hsl)
          : hslToStr(props.hsl),
      }),
      [props.isSelected, props.hsl]
    );

    const LabelButtonItemBodyComponentConditional = useMemo(
      () =>
        disabled
          ? LabelButtonItemBodyDisabledStyled
          : LabelButtonItemBodyStyled,
      [disabled]
    );

    const onLabelClickConditional = useCallback(() => {
      if (disabled) return;
      props.onLabelClick();
    }, [disabled, props]);

    const onVisibilityIconClickConditional = useCallback(
      (ev: BaseSyntheticEvent) => {
        if (disabled) return;
        props.onVisibilityIconClick(ev);
      },
      [disabled, props]
    );

    const EyeIconWrapperConditional = useMemo(
      () => (disabled ? IconWrapper : IconButtonWrapper),
      [disabled]
    );

    return (
      <Root>
        <LabelButtonItemBodyComponentConditional
          style={buttonBgStyleConditional}
          onClick={onLabelClickConditional}
        >
          <Icon icon={'tick'} style={isSelectedIconStyle} />
          <LabelButtonText>{props.labelText}</LabelButtonText>
          <EyeIconWrapperConditional onClick={onVisibilityIconClickConditional}>
            <Icon
              icon={props.isVisible ? 'eye-open' : 'eye-off'}
              iconSize={IconSize.LARGE}
            />
          </EyeIconWrapperConditional>
        </LabelButtonItemBodyComponentConditional>
      </Root>
    );
  }
);

const Root = styled.div`
  padding-bottom: 5px;
`;

const IconWrapper = styled.div`
  height: 30px;
  width: 40px;
  border-radius: 20px;
  flex-basis: 40px;
  flex-grow: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IconButtonWrapper = styled(IconWrapper)`
  &:hover {
    opacity: 0.5;
  }
`;
