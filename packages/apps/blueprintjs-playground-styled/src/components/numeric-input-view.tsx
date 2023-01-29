import { css } from 'styled-components';
import {
  ptButton,
  ptButtonBase,
  ptButtonHeight,
  ptButtonHeightPx,
  ptIconColor,
  ptInput,
} from '../style-definitions';

type Props = Readonly<{
  value: number;
  disabled?: boolean;
  fill?: boolean;
}>;

export const NumericInputView = memoNamed<Props>(
  'NumericInputView',
  ({ value, disabled, fill }) => (
    <NumericInputControlGroup fillSpace={fill}>
      <InputGroup disabled={disabled} fillSpace={fill}>
        <InputAlignedRight
          autoComplete='off'
          disabled={disabled}
          type='text'
          value={value}
          onChange={noop}
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

type StyleProps = Readonly<{ disabled?: boolean; fillSpace?: boolean }>;

const NumericInputControlGroup = styled.div`
  transform: translateZ(0);
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  flex-direction: row;
  -webkit-box-align: stretch;
  align-items: stretch;

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

const InputAlignedRight = styled.input`
  ${ptInput}

  /* .bp3-control-group .bp3-input */
  border-radius: inherit;
  z-index: 2;

  /* .bp3-input-group .bp3-input */
  position: relative;
  width: 100%;

  &:focus {
    /* focus states */
    outline-offset: 2px;

    /* .bp3-control-group .bp3-input:focus */
    border-radius: 3px;
    z-index: 14;
  }

  &:disabled {
    /* .bp3-control-group .bp3-input:disabled */
    z-index: 1;
  }

  /* custom style */
  text-align: right;
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
`;

const Button = styled.button`
  /* .bp3-button */
  ${ptButtonBase}

  ${ptButtonHeight(ptButtonHeightPx)}

  ${ptButton}

  /* .bp3-control-group .bp3-button */
  position: relative;

  /* .bp3-control-group .bp3-button */
  transform: translateZ(0);
  z-index: 4;

  /* .bp3-button-group.bp3-vertical .bp3-button */
  margin-right: 0 !important;

  /* .bp3-numeric-input .bp3-button-group.bp3-vertical > .bp3-button */
  -webkit-box-flex: 1;
  flex: 1 1 14px;
  min-height: 0;
  padding: 0;
  width: 30px;

  &:focus {
    /* .bp3-control-group .bp3-button:focus, .bp3-control-group .bp3-html-select select:focus, .bp3-control-group .bp3-select select:focus */
    z-index: 5;
  }

  &:hover {
    /* .bp3-control-group .bp3-button:hover, .bp3-control-group .bp3-html-select select:hover, .bp3-control-group .bp3-select select:hover */
    z-index: 6;
  }

  &:active {
    /* .bp3-control-group .bp3-button:active, .bp3-control-group .bp3-html-select select:active, .bp3-control-group .bp3-select select:active */
    z-index: 7;
  }

  &:disabled {
    /* .bp3-control-group .bp3-button[readonly], .bp3-control-group .bp3-button:disabled, .bp3-control-group .bp3-button.bp3-disabled, .bp3-control-group .bp3-html-select select[readonly], .bp3-control-group .bp3-html-select select:disabled, .bp3-control-group .bp3-html-select select.bp3-disabled, .bp3-control-group .bp3-select select[readonly], .bp3-control-group .bp3-select select:disabled, .bp3-control-group .bp3-select select.bp3-disabled */
    z-index: 3;
  }
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

  color: ${ptIconColor};

  margin: 0 -7px;
`;

const ChevronUpDownIcon = styled.svg`
  display: block;
  fill: currentColor;
`;
