import { Icon } from '@blueprintjs/core';

export const FilterItem = styled.div`
  margin: 5px;
  &:not(:first-child) {
    margin-top: 15px;
  }
  &:first-child {
    margin-top: 0;
  }
  display: flex;
  align-items: center;
  min-height: 30px;
`;

export const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;

  > :first-child {
    margin-right: 10px;
  }
`;

export const IconCountNumericInputWrapper = styled.div`
  max-width: 80px;
`;

export const FilterItemContent = styled.div`
  margin-left: 31px; // margin 5px + checkbox size 16px + margin-right 10px
  margin-bottom: 5px;
`;

export const RangeSliderWrapper = styled.div`
  margin-left: 14px;
  margin-right: 40px;
`;

export const CheckboxWithRightLabel = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

export const CheckboxWithBottomLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const HorizontalCheckboxesWrapper = styled.div`
  display: flex;

  > :not(:last-child) {
    margin-right: 15px;
  }
`;

export const VerticalCheckboxesWrapper = styled.div`
  display: flex;

  > :not(:last-child) {
    margin-right: 5px;
  }
`;

const Operator = styled.div`
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const LessThanOrEqualTo = memoNamed('LessThanOrEqualTo', () => (
  <Operator>
    <Icon icon={'less-than-or-equal-to'} size={12} />
  </Operator>
));

export const GreaterThanOrEqualTo = memoNamed('GreaterThanOrEqualTo', () => (
  <Operator>
    <Icon icon={'greater-than-or-equal-to'} size={12} />
  </Operator>
));

export const Plus = memoNamed('Plus', () => (
  <Operator>
    <Icon icon={'plus'} size={12} />
  </Operator>
));
