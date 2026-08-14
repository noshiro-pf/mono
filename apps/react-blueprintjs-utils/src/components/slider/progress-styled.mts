import styled from '@emotion/styled';

export const SliderProgressStyled = styled.div`
  height: 6px;
  left: 0;
  right: 0;
  top: 5px;
  position: absolute;

  background: rgba(95, 107, 124, 0.2);

  &.intent-primary {
    background-color: #2d72d2;
  }
  &.intent-success {
    background-color: #238551;
  }
  &.intent-warning {
    background-color: #c87619;
  }
  &.intent-danger {
    background-color: #cd4246;
  }
`;

export const SliderTrackStyled = styled.div`
  height: 6px;
  left: 0;
  right: 0;
  top: 5px;
  position: absolute;

  border-radius: 2px;
  overflow: hidden;
`;
