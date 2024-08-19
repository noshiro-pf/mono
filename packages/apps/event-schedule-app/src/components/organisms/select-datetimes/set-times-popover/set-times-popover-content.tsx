import { Button } from '@blueprintjs/core';
import { timeRangeDefaultValue } from '@noshiro/event-schedule-app-shared';
import { timeRangeReducer } from '../../../../functions';
import { CheckboxView } from '../../../bp';
import { TimeRangeView } from '../../../molecules';
import { ButtonsWrapperAlignEnd } from '../../../styled';
import {
  CheckboxWithBottomLabel,
  VerticalCheckboxesWrapper,
} from '../../detailed-filter';

type Props = Readonly<{
  initialValue: TimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onCancelClick: () => void;
  onOkClick: (
    state: Readonly<{
      timeRange: TimeRange;
      checkboxState: Record<DayOfWeekName, boolean>;
    }>,
  ) => void;
}>;

const dc = dict.eventSettingsPage.section2;

export const SetTimesPopoverContent = memoNamed<Props>(
  'SetTimesPopoverContent',
  ({ initialValue, datetimeSpecification, onCancelClick, onOkClick }) => {
    useEffect(() => {
      dispatch({ type: 'init', timeRange: initialValue });
    }, [initialValue]);

    const timeRange = useObservableValue(timeRange$);

    const checkboxState = useObservableValue(checkboxState$);

    const onOkClickHandler = useCallback(() => {
      onOkClick({ timeRange, checkboxState });
    }, [onOkClick, timeRange, checkboxState]);

    return (
      <div
        css={css`
          padding: 5px;
        `}
      >
        <div
          css={css`
            margin: 5px;
          `}
        >
          <TimeRangeView
            datetimeSpecification={datetimeSpecification}
            timeRange={timeRange}
            onRangeEndChange={onRangeEndChange}
            onRangeStartChange={onRangeStartChange}
          />
        </div>
        <div
          css={css`
            margin: 15px 5px 5px 5px;
          `}
        >
          <div
            css={css`
              display: flex;
            `}
          >
            <div>{dc.setTimesAtOneTimeForDay.title}</div>
          </div>
          <div
            css={css`
              margin: 5px;
            `}
          >
            <VerticalCheckboxesWrapper>
              <CheckboxWithBottomLabel>
                <CheckboxView
                  state={checkboxState.Sun ? 'checked' : 'none'}
                  onCheck={setSundayCheck}
                />
                {dc.setTimesAtOneTimeForDay.items.Sun.abbr}
              </CheckboxWithBottomLabel>
              <CheckboxWithBottomLabel>
                <CheckboxView
                  state={checkboxState.Mon ? 'checked' : 'none'}
                  onCheck={setMondayCheck}
                />
                {dc.setTimesAtOneTimeForDay.items.Mon.abbr}
              </CheckboxWithBottomLabel>
              <CheckboxWithBottomLabel>
                <CheckboxView
                  state={checkboxState.Tue ? 'checked' : 'none'}
                  onCheck={setTuesdayCheck}
                />
                {dc.setTimesAtOneTimeForDay.items.Tue.abbr}
              </CheckboxWithBottomLabel>
              <CheckboxWithBottomLabel>
                <CheckboxView
                  state={checkboxState.Wed ? 'checked' : 'none'}
                  onCheck={setWednesdayCheck}
                />
                {dc.setTimesAtOneTimeForDay.items.Wed.abbr}
              </CheckboxWithBottomLabel>
              <CheckboxWithBottomLabel>
                <CheckboxView
                  state={checkboxState.Thr ? 'checked' : 'none'}
                  onCheck={setThursdayCheck}
                />
                {dc.setTimesAtOneTimeForDay.items.Thr.abbr}
              </CheckboxWithBottomLabel>
              <CheckboxWithBottomLabel>
                <CheckboxView
                  state={checkboxState.Fri ? 'checked' : 'none'}
                  onCheck={setFridayCheck}
                />
                {dc.setTimesAtOneTimeForDay.items.Fri.abbr}
              </CheckboxWithBottomLabel>
              <CheckboxWithBottomLabel>
                <CheckboxView
                  state={checkboxState.Sat ? 'checked' : 'none'}
                  onCheck={setSaturdayCheck}
                />
                {dc.setTimesAtOneTimeForDay.items.Sat.abbr}
              </CheckboxWithBottomLabel>
            </VerticalCheckboxesWrapper>
            <div
              css={css`
                margin: 5px 0;
                display: flex;
              `}
            >
              <div
                css={css`
                  margin-right: 10px;
                  display: flex;
                  align-items: center;
                `}
              >
                <CheckboxView
                  state={checkAllCheckboxState(checkboxState)}
                  onCheck={checkAll}
                />
                <div
                  css={css`
                    margin-left: 5px;
                  `}
                >
                  {dc.setTimesAtOneTimeForDay.checkAll}
                </div>
              </div>
              <Button
                icon={'automatic-updates'}
                intent='none'
                minimal={true}
                text={dc.setTimesAtOneTimeForDay.flipAll}
                onClick={flipAll}
              />
            </div>
          </div>
        </div>
        <ButtonsWrapperAlignEnd>
          <Button
            intent='none'
            text={dict.common.buttonText.cancel}
            onClick={onCancelClick}
          />
          <Button
            intent='primary'
            text={dict.common.buttonText.decide}
            onClick={onOkClickHandler}
          />
        </ButtonsWrapperAlignEnd>
      </div>
    );
  },
);

const { state: timeRange$, dispatch } = createReducer(
  timeRangeReducer,
  timeRangeDefaultValue,
);

const onRangeStartChange = (hm: HoursMinutes): void => {
  dispatch({ type: 'start', hm });
};

const onRangeEndChange = (hm: HoursMinutes): void => {
  dispatch({ type: 'end', hm });
};

const dayCheckboxReducer: Reducer<
  Record<DayOfWeekName, boolean>,
  Readonly<
    | {
        key: DayOfWeekName | 'All';
        checked: boolean;
      }
    | { key: 'flip' }
  >
> = (state, action) =>
  action.key === 'All'
    ? {
        Sun: action.checked,
        Mon: action.checked,
        Tue: action.checked,
        Wed: action.checked,
        Thr: action.checked,
        Fri: action.checked,
        Sat: action.checked,
      }
    : action.key === 'flip'
      ? {
          Sun: !state.Sun,
          Mon: !state.Mon,
          Tue: !state.Tue,
          Wed: !state.Wed,
          Thr: !state.Thr,
          Fri: !state.Fri,
          Sat: !state.Sat,
        }
      : Obj.set(state, action.key, action.checked);

const { state: checkboxState$, dispatch: checkboxStateDispatch } =
  createReducer(dayCheckboxReducer, {
    Sun: true,
    Mon: true,
    Tue: true,
    Wed: true,
    Thr: true,
    Fri: true,
    Sat: true,
  });

const setSundayCheck = (checked: boolean): void => {
  checkboxStateDispatch({ key: 'Sun', checked });
};
const setMondayCheck = (checked: boolean): void => {
  checkboxStateDispatch({ key: 'Mon', checked });
};
const setTuesdayCheck = (checked: boolean): void => {
  checkboxStateDispatch({ key: 'Tue', checked });
};
const setWednesdayCheck = (checked: boolean): void => {
  checkboxStateDispatch({ key: 'Wed', checked });
};
const setThursdayCheck = (checked: boolean): void => {
  checkboxStateDispatch({ key: 'Thr', checked });
};
const setFridayCheck = (checked: boolean): void => {
  checkboxStateDispatch({ key: 'Fri', checked });
};
const setSaturdayCheck = (checked: boolean): void => {
  checkboxStateDispatch({ key: 'Sat', checked });
};
const checkAll = (checked: boolean): void => {
  checkboxStateDispatch({ key: 'All', checked });
};
const flipAll = (): void => {
  checkboxStateDispatch({ key: 'flip' });
};

const checkAllCheckboxState = ({
  Sun,
  Mon,
  Tue,
  Wed,
  Thr,
  Fri,
  Sat,
}: Record<DayOfWeekName, boolean>): 'checked' | 'indeterminate' | 'none' =>
  Sun && Mon && Tue && Wed && Thr && Fri && Sat
    ? 'checked'
    : Sun || Mon || Tue || Wed || Thr || Fri || Sat
      ? 'indeterminate'
      : 'none';
