import styled from 'styled-components';

const FocusVisibleStyledDiv = styled.div`
  &:focus-visible {
    outline: -webkit-focus-ring-color auto 1px;
  }
`;

const FocusStyledDiv = styled(FocusVisibleStyledDiv)`
  &:focus {
    outline: rgba(19, 124, 189, 0.6) auto 2px;
    outline-offset: 2px;
  }
`;

export const Bp3DatePicker = styled(FocusStyledDiv)`
  background: #ffffff;
  border-radius: 3px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  padding: 5px;
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const DayPicker = styled(FocusStyledDiv)`
  display: inline-block;
  min-width: 210px;
  position: relative;
  vertical-align: top;
`;

export const DatePickerMonth = styled(FocusStyledDiv)`
  border-collapse: collapse;
  border-spacing: 0;
  display: inline-table;
  margin: 0 5px 5px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const DatePickerWeekdays = styled(FocusStyledDiv)`
  display: table-header-group;
`;

export const DatePickerWeekdaysRow = styled(FocusStyledDiv)`
  display: table-row;
`;

const DatePickerWeekdayBase = styled(FocusStyledDiv)`
  display: table-cell;
  height: 30px;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  width: 30px;
  font-weight: 600;
  padding-top: 5px;

  /* customized */
  outline: none;
  border-radius: 3px;
`;

export const DatePickerWeekdayReadonly = DatePickerWeekdayBase;

export const DatePickerWeekday = styled(DatePickerWeekdayBase)`
  cursor: pointer;
  &:hover {
    background: #d8e1e8;
  }
`;

export const DatePickerBody = styled(FocusStyledDiv)`
  display: table-row-group;
`;

export const DatePickerWeek = styled(FocusStyledDiv)`
  display: table-row;
`;

const DatePickerDayBase = styled(FocusVisibleStyledDiv)`
  display: table-cell;
  height: 30px;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  width: 30px;
  border-radius: 3px;
  outline: none;
`;

export const DatePickerDay = styled(DatePickerDayBase)`
  cursor: pointer;

  &:active {
    background: #ced9e0;
  }

  &:hover {
    background: #d8e1e8;
    color: #182026;
  }

  &:focus {
    background: #d8e1e8;
    color: #182026;
  }
`;

export const DatePickerDayReadonly = DatePickerDayBase;

const DatePickerDaySelectedBase = styled(DatePickerDayBase)`
  background-color: #137cbd;
  border-radius: 3px;
  color: #ffffff;
`;

export const DatePickerDaySelected = styled(DatePickerDaySelectedBase)`
  cursor: pointer;

  &:hover {
    background-color: #106ba3;
    color: #ffffff;
  }
`;

export const DatePickerDaySelectedReadonly = DatePickerDaySelectedBase;

export const DatePickerDayOutside = styled(DatePickerDayBase)`
  color: rgba(92, 112, 128, 0.6);
`;

export const DatePickerDayWrapper = styled(FocusStyledDiv)`
  border-radius: 3px;
  padding: 7px;
`;
