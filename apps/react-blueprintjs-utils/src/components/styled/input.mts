import styled from '@emotion/styled';
import {
  ptInput,
  ptInputHeightPx,
  ptInputPlaceholder,
} from '../../constants/index.mjs';

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
  &:not(:first-of-type) {
    padding-left: ${ptInputHeightPx}px;
  }

  &:not(:last-of-type) {
    padding-right: ${ptInputHeightPx}px;
  }
`;
