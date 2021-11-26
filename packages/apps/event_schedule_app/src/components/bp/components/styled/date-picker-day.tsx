import styled from 'styled-components';

export const DatePickerStyled = styled.div`
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

export const DayPickerStyled = styled.div`
  display: inline-block;
  min-width: 210px;
  position: relative;
  vertical-align: top;
`;

export const DatePickerMonthStyled = styled.div`
  border-collapse: collapse;
  border-spacing: 0;
  display: inline-table;
  margin: 0 5px 5px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const DatePickerWeekdaysStyled = styled.div`
  display: table-header-group;
`;

export const DatePickerWeekdaysRowStyled = styled.div`
  display: table-row;
`;

const DatePickerWeekdayBaseStyled = styled.div`
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

export const DatePickerWeekdayReadonlyStyled = DatePickerWeekdayBaseStyled;

export const DatePickerWeekdayStyled = styled(DatePickerWeekdayBaseStyled)`
  cursor: pointer;
  &:hover {
    background: #d8e1e8;
  }
`;

export const DatePickerBodyStyled = styled.div`
  display: table-row-group;
`;

export const DatePickerWeekStyled = styled.div`
  display: table-row;
`;

const DatePickerDayBaseStyled = styled.div`
  display: table-cell;
  height: 30px;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  width: 30px;
  border-radius: 3px;
  outline: none;
`;

export const DatePickerDayStyled = styled(DatePickerDayBaseStyled)`
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

export const DatePickerDayReadonlyStyled = DatePickerDayBaseStyled;

const DatePickerDaySelectedBaseStyled = styled(DatePickerDayBaseStyled)`
  background-color: #137cbd;
  border-radius: 3px;
  color: #ffffff;
`;

export const DatePickerDaySelectedStyled = styled(
  DatePickerDaySelectedBaseStyled
)`
  cursor: pointer;

  &:hover {
    background-color: #106ba3;
    color: #ffffff;
  }
`;

export const DatePickerDaySelectedReadonlyStyled =
  DatePickerDaySelectedBaseStyled;

export const DatePickerDayOutside = styled(DatePickerDayBaseStyled)`
  color: rgba(92, 112, 128, 0.6);
`;

export const DatePickerDayWrapperStyled = styled.div`
  border-radius: 3px;
  padding: 7px;
`;
