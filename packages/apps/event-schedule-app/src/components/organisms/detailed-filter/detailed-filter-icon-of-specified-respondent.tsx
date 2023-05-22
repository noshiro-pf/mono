import { AnswerFilterAndSortStore } from '../../../store';
import { CustomIcon } from '../../atoms';
import { CheckboxView } from '../../bp';
import {
  CheckboxWithRightLabel,
  CheckboxWrapper,
  FilterItem,
  FilterItemContent,
  HorizontalCheckboxesWrapper,
} from './styled';

const dc = dict.answerPage.detailedFilter;

type Props = DeepReadonly<{
  enabled: boolean;
  goodDisabled: boolean;
  fairDisabled: boolean;
  poorDisabled: boolean;
  noneDisabled: boolean;
  checkState: {
    key: string;
    username: string;
    checkState: Record<
      AnswerIconIdWithNone,
      {
        checked: boolean;
        onCheck: (value: boolean) => void;
      }
    >;
  }[];
}>;

const iconSize = 14; /* px */

/* 特定の回答者の記号で絞り込み */
export const DetailedFilterIconOfSpecifiedRespondent = memoNamed<Props>(
  'DetailedFilterIconOfSpecifiedRespondent',
  ({
    enabled,
    goodDisabled,
    fairDisabled,
    poorDisabled,
    noneDisabled,
    checkState,
  }) => (
    <>
      <FilterItem>
        <CheckboxWrapper>
          <CheckboxView
            state={enabled ? 'checked' : 'none'}
            onCheck={
              AnswerFilterAndSortStore.setEnabledFilteringByIconOfSpecifiedRespondent
            }
          />
          <span>{dc.filterItems.iconOfSpecifiedRespondent.title}</span>
        </CheckboxWrapper>
      </FilterItem>

      <FilterItemContent>
        {checkState.map((respondent, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <div
              css={css`
                width: 60px;
                margin-right: 10px;
                overflow-x: hidden;
                white-space: nowrap;
                display: inline-block;
                text-overflow: ellipsis;
              `}
            >
              {respondent.username}
            </div>
            <HorizontalCheckboxesWrapper>
              <CheckboxWithRightLabel>
                <CheckboxView
                  disabled={!enabled || goodDisabled}
                  state={
                    !goodDisabled && respondent.checkState.good.checked
                      ? 'checked'
                      : 'none'
                  }
                  onCheck={respondent.checkState.good.onCheck}
                />
                <CheckboxLabelIcon>
                  <CustomIcon iconName={'good'} size={iconSize} />
                </CheckboxLabelIcon>
              </CheckboxWithRightLabel>

              <CheckboxWithRightLabel>
                <CheckboxView
                  disabled={!enabled || fairDisabled}
                  state={
                    !fairDisabled && respondent.checkState.fair.checked
                      ? 'checked'
                      : 'none'
                  }
                  onCheck={respondent.checkState.fair.onCheck}
                />
                <CheckboxLabelIcon>
                  <CustomIcon iconName={'fair'} size={iconSize} />
                </CheckboxLabelIcon>
              </CheckboxWithRightLabel>

              <CheckboxWithRightLabel>
                <CheckboxView
                  disabled={!enabled || poorDisabled}
                  state={
                    !poorDisabled && respondent.checkState.poor.checked
                      ? 'checked'
                      : 'none'
                  }
                  onCheck={respondent.checkState.poor.onCheck}
                />
                <CheckboxLabelIcon>
                  <CustomIcon iconName={'poor'} size={iconSize} />
                </CheckboxLabelIcon>
              </CheckboxWithRightLabel>

              <CheckboxWithRightLabel>
                <CheckboxView
                  disabled={!enabled || noneDisabled}
                  state={
                    !noneDisabled && respondent.checkState.none.checked
                      ? 'checked'
                      : 'none'
                  }
                  onCheck={respondent.checkState.none.onCheck}
                />
                <CheckboxLabel>
                  {dc.filterItems.iconOfSpecifiedRespondent.unanswered}
                </CheckboxLabel>
              </CheckboxWithRightLabel>
            </HorizontalCheckboxesWrapper>
          </div>
        ))}
      </FilterItemContent>
    </>
  )
);

const CheckboxLabel = styled.div`
  margin-left: 5px;
`;

const CheckboxLabelIcon = styled(CheckboxLabel)`
  width: ${iconSize}px;
  height: ${iconSize}px; // 明示的に指定しないとなぜか高さが18pxくらいになってしまう…
`;
