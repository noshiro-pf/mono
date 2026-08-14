import { Button } from '@blueprintjs/core';
import { css } from '@emotion/react';
import * as React from 'react';
import { CheckboxView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { createReducer } from 'synstate-react-hooks';
import { TimeRange } from 'ts-fortress-types';
import { type DayOfWeekName, type ReadonlyRecord } from 'ts-type-forge';
import { timeRangeReducer } from '../../../../functions/index.mjs';
import { Obj, type Reducer } from '../../../../utils-ported/index.mjs';
import { TimeRangeView } from '../../../molecules/index.mjs';
import { ButtonsWrapperAlignEnd } from '../../../styled/index.mjs';
import {
  CheckboxWithBottomLabel,
  VerticalCheckboxesWrapper,
} from '../../detailed-filter/index.mjs';

type Props = Readonly<{
  initialValue: TimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onCancelClick: () => void;
  onOkClick: (
    state: Readonly<{
      timeRange: TimeRange;
      checkboxState: ReadonlyRecord<DayOfWeekName, boolean>;
    }>,
  ) => void;
}>;

const dc = dict.eventSettingsPage.section2;

export const SetTimesPopoverContent = memoNamed<Props>(
  'SetTimesPopoverContent',
  ({ initialValue, datetimeSpecification, onCancelClick, onOkClick }) => {
    React.useEffect(() => {
      dispatch({ type: 'init', timeRange: initialValue });
    }, [initialValue]);

    const timeRange = useTimeRange();

    const checkboxState = useCheckboxState();

    const onOkClickHandler = React.useCallback(() => {
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
                intent={'none'}
                text={dc.setTimesAtOneTimeForDay.flipAll}
                variant={'minimal'}
                onClick={flipAll}
              />
            </div>
          </div>
        </div>
        <ButtonsWrapperAlignEnd>
          <Button
            intent={'none'}
            text={dict.common.buttonText.cancel}
            onClick={onCancelClick}
          />
          <Button
            intent={'primary'}
            text={dict.common.buttonText.decide}
            onClick={onOkClickHandler}
          />
        </ButtonsWrapperAlignEnd>
      </div>
    );
  },
);

const [useTimeRange, dispatch] = createReducer(
  timeRangeReducer,
  TimeRange.defaultValue,
);

const onRangeStartChange = (hm: HoursMinutes): void => {
  dispatch({ type: 'start', hm });
};

const onRangeEndChange = (hm: HoursMinutes): void => {
  dispatch({ type: 'end', hm });
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

const [useCheckboxState, checkboxStateDispatch] = createReducer(
  dayCheckboxReducer,
  {
    Sun: true,
    Mon: true,
    Tue: true,
    Wed: true,
    Thr: true,
    Fri: true,
    Sat: true,
  },
);

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
}: ReadonlyRecord<DayOfWeekName, boolean>):
  'checked' | 'indeterminate' | 'none' =>
  Sun && Mon && Tue && Wed && Thr && Fri && Sat
    ? 'checked'
    : Sun || Mon || Tue || Wed || Thr || Fri || Sat
      ? 'indeterminate'
      : 'none';
