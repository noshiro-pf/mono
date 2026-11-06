import type { InitializedObservable } from 'synstate';
import {
  constant,
  deriveBindable,
  For,
  inlineMap,
  mapBindable,
  type JSX,
} from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import { dict } from '../../../constants/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CustomIcon } from '../../atoms/index.mjs';
import { CheckboxView } from '../../molecules/index.mjs';
import { filterView } from './filter-state.mjs';
import {
  CheckboxWithRightLabel,
  CheckboxWrapper,
  FilterItem,
  FilterItemContent,
  HorizontalCheckboxesWrapper,
} from './styled.js';
import * as styles from './styled.module.css';

const dc = dict.answerPage.detailedFilter;

const iconSize = 14; /* px */

/** Whether no date can have the icon, so that filtering by it is pointless. */
const iconDisabled: ReadonlyRecord<
  AnswerIconIdWithNone,
  InitializedObservable<boolean>
> = {
  good: filterView(
    ({ iconState }) =>
      iconState.good.max === 0 || iconState.goodPlusFair.max === 0,
  ),
  fair: filterView(
    ({ iconState }) =>
      iconState.fair.max === 0 ||
      iconState.goodPlusFair.max === 0 ||
      iconState.fairPlusPoor.max === 0,
  ),
  poor: filterView(
    ({ iconState }) =>
      iconState.poor.max === 0 || iconState.fairPlusPoor.max === 0,
  ),
  none: filterView((s) => s.filledDateOnly),
} as const;

const enabled = filterView((s) => s.iconOfSpecifiedRespondent.enabled);

/* 特定の回答者の記号で絞り込み */
export const DetailedFilterIconOfSpecifiedRespondent = (): JSX.Element => (
  <>
    <FilterItem>
      <CheckboxWrapper>
        <CheckboxView
          state={mapBindable(enabled, (e) => (e ? 'checked' : 'none'))}
          onCheck={
            AnswerFilterAndSortStore.setEnabledFilteringByIconOfSpecifiedRespondent
          }
        />
        <span>{constant(dc.filterItems.iconOfSpecifiedRespondent.title)}</span>
      </CheckboxWrapper>
    </FilterItem>

    <FilterItemContent>
      <For
        items={AnswerFilterAndSortStore.iconOfSpecifiedRespondentCheckState$}
        key={(_, index) => index}
      >
        {(respondent$) => {
          const checkbox = (icon: AnswerIconIdWithNone): JSX.Element => (
            <CheckboxView
              disabled={deriveBindable(
                [enabled, iconDisabled[icon]],
                (isEnabled, isDisabled) => !isEnabled || isDisabled,
              )}
              state={deriveBindable(
                [respondent$, iconDisabled[icon]],
                (respondent, isDisabled) =>
                  !isDisabled && respondent.checkState[icon].checked
                    ? 'checked'
                    : 'none',
              )}
              onCheck={(checked) => {
                respondent$
                  .getSnapshot()
                  .value.checkState[icon].onCheck(checked);
              }}
            />
          );

          return (
            <div class={constant(styles.respondentRow)}>
              <div class={constant(styles.respondentName)}>
                {inlineMap(respondent$, (r) => r.username)}
              </div>
              <HorizontalCheckboxesWrapper>
                {(['good', 'fair', 'poor'] as const).map((icon) => (
                  <CheckboxWithRightLabel>
                    {checkbox(icon)}
                    <div class={constant(styles.checkboxLabelIcon)}>
                      <CustomIcon iconName={icon} size={iconSize} />
                    </div>
                  </CheckboxWithRightLabel>
                ))}
                <CheckboxWithRightLabel>
                  {checkbox('none')}
                  <div class={constant(styles.checkboxLabel)}>
                    {constant(
                      dc.filterItems.iconOfSpecifiedRespondent.unanswered,
                    )}
                  </div>
                </CheckboxWithRightLabel>
              </HorizontalCheckboxesWrapper>
            </div>
          );
        }}
      </For>
    </FilterItemContent>
  </>
);
