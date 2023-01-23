import { ptInputHeightPx } from '../common';
import { ptInput, ptInputPlaceholder } from './common';

export const Input = styled.input`
  ${ptInputPlaceholder}
  ${ptInput}

  &::-ms-clear {
    display: none;
  }
`;

export const InputGroupInput = styled(Input)`
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
