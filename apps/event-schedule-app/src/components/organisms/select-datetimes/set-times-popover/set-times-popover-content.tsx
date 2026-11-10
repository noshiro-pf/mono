import { Button } from 'blueprint-synstate';
import {
  combine,
  createState,
  filter,
  map,
  type InitializedObservable,
} from 'synstate';
import {
  constant,
  createAfterUpdate,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { TimeRange } from 'ts-fortress-types';
import type { DayOfWeekName, ReadonlyRecord, Reducer } from 'ts-type-forge';
import { dict } from '../../../../constants/index.mjs';
import { timeRangeReducer } from '../../../../functions/index.mjs';
import type { SetTimesSubmission } from '../../../../hooks/index.mjs';
import { Obj } from '../../../../utils-ported/index.mjs';
import {
  CheckboxView,
  TimeRangeView,
  type CheckboxViewState,
} from '../../../molecules/index.mjs';
import { ButtonsWrapperAlignEnd } from '../../../styled/index.mjs';
import {
  CheckboxWithBottomLabel,
  VerticalCheckboxesWrapper,
} from '../../detailed-filter/index.mjs';
import * as styles from '../select-datetimes.module.css';

type Props = Readonly<{
  /** What the time range is set back to each time the popover opens. */
  initialValue: InitializedObservable<TimeRange>;
  isOpen: InitializedObservable<boolean>;
  datetimeSpecification: Bindable<DatetimeSpecificationEnumType>;
  onCancelClick: () => void;
  onOkClick: (state: SetTimesSubmission) => void;
}>;

const dc = dict.eventSettingsPage.section2;

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'] as const;

export const SetTimesPopoverContent = ({
  initialValue,
  isOpen,
  datetimeSpecification,
  onCancelClick,
  onOkClick,
}: Props): JSX.Element => {
  const [timeRange$, setTimeRange, { updateState: updateTimeRange }] =
    createState<TimeRange>(TimeRange.defaultValue);

  const afterUpdate = createAfterUpdate();

  // The time range starts from the list's each time the popover opens, as the
  // content Blueprint mounted on each opening did; the days stay as they were.
  combine([isOpen, initialValue])
    .pipe(filter(([open]) => open))
    .pipe(map(([, value]) => value))
    .subscribe((value) => {
      afterUpdate(() => {
        setTimeRange(value);
      });
    });

  return (
    <div
      class={constant(styles.popover)}
      data-e2e={constant('set-times-popover')}
    >
      <div class={constant(styles.popoverTime)}>
        <TimeRangeView
          datetimeSpecification={datetimeSpecification}
          timeRange={timeRange$}
          onRangeEndChange={(hm) => {
            updateTimeRange((s) => timeRangeReducer(s, { type: 'end', hm }));
          }}
          onRangeStartChange={(hm) => {
            updateTimeRange((s) => timeRangeReducer(s, { type: 'start', hm }));
          }}
        />
      </div>
      <div class={constant(styles.popoverDays)}>
        <div class={constant(styles.flex)}>
          <div>{constant(dc.setTimesAtOneTimeForDay.title)}</div>
        </div>
        <div class={constant(styles.popoverCheckboxes)}>
          <VerticalCheckboxesWrapper>
            {days.map((day) => (
              <CheckboxWithBottomLabel>
                <CheckboxView
                  state={checkboxState$.pipe(
                    map((s) => (s[day] ? 'checked' : 'none')),
                  )}
                  onCheck={(checked) => {
                    checkboxStateDispatch({ key: day, checked });
                  }}
                />
                {constant(dc.setTimesAtOneTimeForDay.items[day].abbr)}
              </CheckboxWithBottomLabel>
            ))}
          </VerticalCheckboxesWrapper>
          <div class={constant(styles.checkAllRow)}>
            <div class={constant(styles.checkAll)}>
              <CheckboxView
                state={checkboxState$.pipe(map(checkAllCheckboxState))}
                onCheck={(checked) => {
                  checkboxStateDispatch({ key: 'All', checked });
                }}
              />
              <div class={constant(styles.checkAllLabel)}>
                {constant(dc.setTimesAtOneTimeForDay.checkAll)}
              </div>
            </div>
            <Button
              icon={'automatic-updates'}
              intent={'none'}
              text={constant(dc.setTimesAtOneTimeForDay.flipAll)}
              variant={constant('minimal')}
              onClick={() => {
                checkboxStateDispatch({ key: 'flip' });
              }}
            />
          </div>
        </div>
      </div>
      <ButtonsWrapperAlignEnd>
        <Button
          intent={'none'}
          text={constant(dict.common.buttonText.cancel)}
          onClick={onCancelClick}
        />
        <Button
          intent={'primary'}
          text={constant(dict.common.buttonText.decide)}
          onClick={() => {
            onOkClick({
              timeRange: timeRange$.getSnapshot().value,
              checkboxState: checkboxState$.getSnapshot().value,
            });
          }}
        />
      </ButtonsWrapperAlignEnd>
    </div>
  );
};

const dayCheckboxReducer: Reducer<
  ReadonlyRecord<DayOfWeekName, boolean>,
  Readonly<{ key: DayOfWeekName | 'All'; checked: boolean } | { key: 'flip' }>
> = (state, action) =>
  action.key === 'All'
    ? ({
        Sun: action.checked,
        Mon: action.checked,
        Tue: action.checked,
        Wed: action.checked,
        Thr: action.checked,
        Fri: action.checked,
        Sat: action.checked,
      } as const)
    : action.key === 'flip'
      ? ({
          Sun: !state.Sun,
          Mon: !state.Mon,
          Tue: !state.Tue,
          Wed: !state.Wed,
          Thr: !state.Thr,
          Fri: !state.Fri,
          Sat: !state.Sat,
        } as const)
      : Obj.set(state, action.key, action.checked);

// Kept for the page's lifetime, as the days picked last time are kept.
const [checkboxState$, , { updateState: updateCheckboxState }] = createState<
  ReadonlyRecord<DayOfWeekName, boolean>
>({
  Sun: true,
  Mon: true,
  Tue: true,
  Wed: true,
  Thr: true,
  Fri: true,
  Sat: true,
});

const checkboxStateDispatch = (
  action: Parameters<typeof dayCheckboxReducer>[1],
): void => {
  updateCheckboxState((s) => dayCheckboxReducer(s, action));
};

const checkAllCheckboxState = ({
  Sun,
  Mon,
  Tue,
  Wed,
  Thr,
  Fri,
  Sat,
}: ReadonlyRecord<DayOfWeekName, boolean>): CheckboxViewState =>
  Sun && Mon && Tue && Wed && Thr && Fri && Sat
    ? 'checked'
    : Sun || Mon || Tue || Wed || Thr || Fri || Sat
      ? 'indeterminate'
      : 'none';
