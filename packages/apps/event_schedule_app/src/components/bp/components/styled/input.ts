import styled from 'styled-components';
import { ptInput, ptInputHeightPx, ptInputPlaceholder } from '../../constants';

const InputStyled = styled.input`
  ${ptInputPlaceholder}
  ${ptInput}

  &::-ms-clear {
    display: none;
  }
`;

export const InputGroupInputStyled = styled(InputStyled)`
  position: relative;
  width: 100%;

  // add space if there's something before or after the input
  &:not(:first-child) {
    padding-left: ${ptInputHeightPx}px;
  }

  &:not(:last-child) {
    padding-right: ${ptInputHeightPx}px;
  }
`;
