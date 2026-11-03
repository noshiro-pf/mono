import { Button } from 'blueprint-synstate';
import type { InitializedObservable } from 'synstate';
import {
  constant,
  derive,
  For,
  If,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Num, type IMapMapped } from 'ts-data-forge';
import { dict } from '../../../constants/index.mjs';
import {
  AnswerFilterAndSortStore,
  AnswerPageStore,
  AnswerTableStore,
} from '../../../store/index.mjs';
import type { AnswerTableCell } from '../../../types/index.mjs';
import { CustomIcon, RequiredParticipantIcon } from '../../atoms/index.mjs';
import { borderedTableClass } from '../../styled/index.mjs';
import * as styles from './answer-table.module.css';
import { CommentButton } from './comment-button.js';
import { DatetimeRangeCell } from './datetime-range-cell.js';
import { FilterByIconPopover } from './filter-by-icon-popover/index.mjs';
import { SortButton } from './sort-button.js';

const dc = dict.answerPage.answers;

type Props = Readonly<{
  datetimeSpecification: Bindable<EventSchedule['datetimeSpecification']>;
  answers: InitializedObservable<readonly Answer[]>;
  editAnswerButtonIsDisabled: Bindable<boolean>;
  holidaysJpDefinition: InitializedObservable<
    IMapMapped<YearMonthDate, string, YmdKey>
  >;
}>;

const {
  tableIsMinimized$,
  dateStringIsMinimized$,
  answerIconIsHidden$,
  tableBodyValuesFiltered$,
} = AnswerTableStore;

export const AnswerTable = ({
  datetimeSpecification,
  answers,
  editAnswerButtonIsDisabled,
  holidaysJpDefinition,
}: Props): JSX.Element => {
  const dateMinimized = derive(
    [tableIsMinimized$, dateStringIsMinimized$],
    (table, date) => table || date,
  );

  const iconsShown = view(answerIconIsHidden$, (hidden) => !hidden);

  return (
    <table
      class={{
        [borderedTableClass]: constant(true),
        [styles.table]: constant(true),
        [styles.minimized]: tableIsMinimized$,
      }}
      data-e2e={constant('answer-table')}
    >
      <thead>
        <tr>
          <th class={constant('sticky horizontal')}>
            <div class={constant(styles.topLeftCell)}>
              <div
                class={constant(
                  `${styles.centering} ${styles.datetimeHeaderCell}`,
                )}
              >
                <If
                  cond={mapBindable(dateMinimized, (c) => !c)}
                  then={
                    <span class={constant(styles.paddedSpan)}>
                      {constant(dc.datetime)}
                    </span>
                  }
                />
                <SortButton
                  onSortChange={
                    AnswerFilterAndSortStore.onDatetimeSortOrderChange
                  }
                />
              </div>
            </div>
          </th>
          <th>
            <If
              cond={mapBindable(dateMinimized, (c) => !c)}
              then={
                <span class={constant(styles.paddedSpan)}>
                  {constant(dc.score)}
                </span>
              }
            />
            <SortButton
              onSortChange={AnswerFilterAndSortStore.onScoreSortOrderChange}
            />
          </th>

          {/* icons */}
          <If
            cond={iconsShown}
            then={
              <>
                {(['good', 'fair', 'poor'] as const).map((iconId) => (
                  <th class={constant(styles.iconHeaderCell)}>
                    <div class={constant(styles.centering)}>
                      <FilterByIconPopover answerIconId={iconId} />
                    </div>
                  </th>
                ))}
              </>
            }
          />

          <For items={answers} key={(answer) => answer.id}>
            {(answer$) => (
              <th class={constant(styles.answerCell)}>
                <If
                  cond={editAnswerButtonIsDisabled}
                  else={
                    <Button
                      class={styles.nameButton}
                      text={view(answer$, (a) => a.user.name)}
                      title={view(answer$, (a) => a.user.name)}
                      variant={constant('minimal')}
                      onClick={() => {
                        AnswerPageStore.onAnswerClick(
                          answer$.getSnapshot().value,
                        );
                      }}
                    />
                  }
                  then={<>{view(answer$, (a) => a.user.name)}</>}
                />
                <If
                  cond={view(answer$, (a) => a.isRequiredParticipants)}
                  then={
                    <div class={constant(styles.requiredParticipantIcon)}>
                      <RequiredParticipantIcon />
                    </div>
                  }
                />
              </th>
            )}
          </For>
        </tr>
      </thead>
      <tbody>
        <For items={tableBodyValuesFiltered$} key={(row) => row.key}>
          {(row$) => {
            const { datetimeRange } = row$.getSnapshot().value;

            return (
              <tr
                data-e2e={constant('answer-table-row')}
                style={{
                  'background-color': view(row$, (r) => r.backgroundColor),
                }}
              >
                <td class={constant('sticky horizontal')}>
                  <DatetimeRangeCell
                    datetimeRange={datetimeRange}
                    datetimeSpecification={datetimeSpecification}
                    holidaysJpDefinition={holidaysJpDefinition}
                    minimized={dateMinimized}
                  />
                </td>
                <td data-e2e={constant('score')}>
                  <span>
                    {view(row$, (r) => Num.roundAt(r.score, 2).toString())}
                  </span>
                </td>
                <If
                  cond={iconsShown}
                  then={
                    <For
                      items={view(row$, (r) => r.answerSummaryRow ?? [])}
                      key={(_, index) => index}
                    >
                      {(count$) => (
                        <td>
                          <div class={constant(styles.summaryCell)}>
                            <span>{view(count$, String)}</span>
                            <span class={constant(styles.xSmall)}>
                              {constant(dc.numAnswersUnit)}
                            </span>
                          </div>
                        </td>
                      )}
                    </For>
                  }
                />
                <For
                  items={view(row$, (r) => r.answerTableRow ?? [])}
                  key={(_, index) => index}
                >
                  {(cell$) => (
                    <td class={constant(styles.answerCell)}>
                      <AnswerCell cell={cell$} />
                    </td>
                  )}
                </For>
              </tr>
            );
          }}
        </For>

        {/* コメント行 */}
        <tr>
          <td class={constant('sticky horizontal')}>{constant(dc.comment)}</td>

          {/* spacer */}
          <td />

          {/* spacer - icons */}
          <If
            cond={iconsShown}
            then={
              <>
                <td />
                <td />
                <td />
              </>
            }
          />

          <For items={answers} key={(answer) => answer.id}>
            {(answer$) => (
              <td class={constant(styles.answerCell)}>
                <div>
                  <If
                    cond={view(answer$, (a) => a.comment !== '')}
                    then={
                      <CommentButton
                        comment={view(answer$, (a) => a.comment)}
                      />
                    }
                  />
                </div>
              </td>
            )}
          </For>
        </tr>
      </tbody>
    </table>
  );
};

/** An icon, with the point, weight and comment it was given. */
const AnswerCell = ({
  cell,
}: Readonly<{
  cell: InitializedObservable<AnswerTableCell>;
}>): JSX.Element => (
  <For
    items={view(cell, (c) => (c.iconId === 'none' ? [] : [c.iconId]))}
    key={(iconId) => iconId}
  >
    {(iconId$) => (
      <div class={constant(styles.answerIconCell)}>
        <div class={constant(styles.iconAndString)}>
          <CustomIcon iconName={iconId$.getSnapshot().value} />
          <If
            cond={view(cell, (c) => c.showPoint)}
            then={
              <span class={constant(styles.annotation)}>
                {view(
                  cell,
                  (c) =>
                    `${dict.common.brace.start}${c.point}${dict.common.brace.end}`,
                )}
              </span>
            }
          />
          <If
            cond={derive(
              [cell, tableIsMinimized$],
              (c, minimized) => c.weight !== 1 && !minimized,
            )}
            then={
              <span class={constant(styles.annotation)}>
                <span class={constant(styles.weightTimes)}>
                  {constant(dc.times)}
                </span>
                <div>{view(cell, (c) => c.weight.toString())}</div>
              </span>
            }
          />
        </div>
        <If
          cond={derive(
            [cell, tableIsMinimized$],
            (c, minimized) => c.comment !== '' && !minimized,
          )}
          then={
            <span class={constant(styles.cellComment)}>
              <CommentButton
                comment={view(cell, (c) => c.comment)}
                useSmallButton
              />
            </span>
          }
        />
      </div>
    )}
  </For>
);
