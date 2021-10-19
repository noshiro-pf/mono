import { memoNamed } from '@noshiro/react-utils';
import styled, { css } from 'styled-components';

type Props = Readonly<{
  value: number;
  disabled?: boolean;
  fill?: boolean;
}>;

export const NumericInputView = memoNamed<Props>(
  'NumericInputView',
  ({ value, disabled, fill }) => (
    <NumericInputControlGroup fill={fill}>
      <InputGroup disabled={disabled} fill={fill}>
        <Input
          autoComplete='off'
          disabled={disabled}
          type='text'
          value={value}
        />
      </InputGroup>
      <ButtonGroupVerticalFixed>
        <ButtonUp aria-label='increment' disabled={disabled} type='button'>
          <IconWrapper aria-hidden='true'>
            <ChevronUpDownIcon
              data-icon='chevron-up'
              height='16'
              viewBox='0 0 16 16'
              width='16'
            >
              <path
                d='M12.71 9.29l-4-4C8.53 5.11 8.28 5 8 5s-.53.11-.71.29l-4 4a1.003 1.003 0 001.42 1.42L8 7.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z'
                fillRule='evenodd'
              />
            </ChevronUpDownIcon>
          </IconWrapper>
        </ButtonUp>
        <ButtonDown aria-label='decrement' disabled={disabled} type='button'>
          <IconWrapper aria-hidden='true'>
            <ChevronUpDownIcon
              data-icon='chevron-down'
              height='16'
              viewBox='0 0 16 16'
              width='16'
            >
              <path
                d='M12 5c-.28 0-.53.11-.71.29L8 8.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l4-4A1.003 1.003 0 0012 5z'
                fillRule='evenodd'
              />
            </ChevronUpDownIcon>
          </IconWrapper>
        </ButtonDown>
      </ButtonGroupVerticalFixed>
    </NumericInputControlGroup>
  )
);

const defaultFocusStyle = css`
  outline: rgba(19, 124, 189, 0.6) auto 2px;
  outline-offset: 2px;
`;

const defaultFocusVisibleStyle = css`
  outline: -webkit-focus-ring-color auto 1px;
`;

type StyleProps = Readonly<{ disabled?: boolean; fill?: boolean }>;

const NumericInputControlGroup = styled.div`
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
    props.fill === true
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
    props.fill === true
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
`;

const ButtonGroupVerticalFixed = styled.div`
  display: inline-flex;

  -webkit-box-flex: 0;
  flex-grow: 0;
  flex-shrink: 0;

  -webkit-box-align: stretch;
  align-items: stretch;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  vertical-align: top;

  border-radius: 0 3px 3px 0;

  margin-right: -1px;

  &:focus {
    ${defaultFocusStyle}
  }

  &:focus-visible {
    ${defaultFocusVisibleStyle}
  }
`;

const Button = styled.button`
  font-family: inherit;
  line-height: 1.15;
  margin: 0;

  overflow: visible;

  text-transform: none;

  -webkit-appearance: button;

  display: inline-flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  border: none;
  cursor: pointer;
  font-size: 14px;
  -webkit-box-pack: center;
  justify-content: center;
  text-align: left;
  vertical-align: middle;
  min-width: 30px;

  background-color: #f5f8fa;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0)
  );
  box-shadow: inset 0 0 0 1px rgb(16 22 26 / 20%),
    inset 0 -1px 0 rgb(16 22 26 / 10%);
  color: #182026;

  position: relative;

  transform: translateZ(0);
  z-index: 4;

  margin-right: 0 !important;

  -webkit-box-flex: 1;
  flex: 1 1 14px;
  min-height: 0;
  padding: 0;
  width: 30px;

  &:focus {
    ${defaultFocusStyle}
    z-index: 5;
  }

  &:focus-visible {
    ${defaultFocusVisibleStyle}
  }

  &:active {
    background-color: #d8e1e8;
    background-image: none;
    box-shadow: inset 0 0 0 1px rgb(16 22 26 / 20%),
      inset 0 1px 2px rgb(16 22 26 / 20%);

    z-index: 7;
  }

  &:hover {
    background-clip: padding-box;
    background-color: #ebf1f5;
    box-shadow: inset 0 0 0 1px rgb(16 22 26 / 20%),
      inset 0 -1px 0 rgb(16 22 26 / 10%);
    z-index: 6;
  }

  ${(props: StyleProps) =>
    props.disabled === true
      ? css`
          background-color: rgba(206, 217, 224, 0.5);
          background-image: none;
          box-shadow: none;
          color: rgba(92, 112, 128, 0.6);
          cursor: not-allowed;
          outline: none;
        `
      : css``}
`;

const ButtonUp = styled(Button)`
  margin-bottom: -1px;

  border-radius: 0 3px 0 0;
`;

const ButtonDown = styled(Button)`
  border-radius: 0 0 3px 0;
`;

const IconWrapper = styled.span`
  display: inline-block;
  -webkit-box-flex: 0;
  flex: 0 0 auto;
  vertical-align: text-bottom;

  color: #5c7080;

  margin: 0 -7px;
`;

const ChevronUpDownIcon = styled.svg`
  display: block;
  fill: currentColor;
`;
