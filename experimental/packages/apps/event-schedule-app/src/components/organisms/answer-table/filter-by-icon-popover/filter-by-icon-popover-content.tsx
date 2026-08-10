import { Button } from '@blueprintjs/core';
import { SwitchWithoutLabelStyled } from '@noshiro/react-blueprintjs-utils';
import { type NumIconFilterState } from '../../../../types';
import { IconCountNumericInput } from '../../../molecules';

const dc = dict.answerPage.answers.iconHeaderFilter;

type Props = Readonly<{
  state: NumIconFilterState;
  upperLimit: SafeUint;
  onMinChange: (value: SafeUint) => void;
  onMaxChange: (value: SafeUint) => void;
  enableFiltering: () => void;
  disableFiltering: () => void;
  onClose: () => void;
}>;

export const FilterByIconPopoverContent = memoNamed<Props>(
  'FilterByIconPopoverContent',
  ({
    state,
    upperLimit,
    onMinChange,
    onMaxChange,
    onClose,
    enableFiltering,
    disableFiltering,
  }) => {
    const switchHandler = useCallback<React.FormEventHandler<HTMLInputElement>>(
      (ev) => {
        if (!(ev.target instanceof HTMLInputElement)) return;
        if (ev.target.checked) {
          enableFiltering();
        } else {
          disableFiltering();
        }
      },
      [enableFiltering, disableFiltering],
    );

    return (
      <div
        css={css`
          padding: 10px;
        `}
      >
        <Row>
          <NumericInputWrapper>
            <IconCountNumericInput
              count={state.min}
              disabled={!state.enabled}
              max={upperLimit}
              onCountChange={onMinChange}
            />
          </NumericInputWrapper>
          <Suffix>{dc.ge}</Suffix>
        </Row>
        <Row>
          <NumericInputWrapper>
            <IconCountNumericInput
              count={state.max}
              disabled={!state.enabled}
              max={upperLimit}
              onCountChange={onMaxChange}
            />
          </NumericInputWrapper>
          <Suffix>{dc.le}</Suffix>
        </Row>

        <Footer>
          <div
            css={css`
              margin: 5px 10px;
            `}
          >
            <SwitchWithoutLabelStyled
              checked={state.enabled}
              label={dc.enableFilteringSwitchLabel}
              onChange={switchHandler}
            />
          </div>
          <Button
            intent={'primary'}
            text={dict.common.buttonText.close}
            onClick={onClose}
          />
        </Footer>
      </div>
    );
  },
);

const numericInputWrapperWidthPx = 120;

const Row = styled.div`
  margin: 3px;
  display: flex;
  align-items: center;
  width: ${numericInputWrapperWidthPx + 42}px;
`;

const NumericInputWrapper = styled.div`
  flex: 0 0 ${numericInputWrapperWidthPx}px;
`;

const Suffix = styled.div`
  white-space: nowrap;
  margin-left: 5px;
`;

const Footer = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
