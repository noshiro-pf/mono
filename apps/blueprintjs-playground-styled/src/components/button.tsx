import styled from '@emotion/styled';
import {
  ptButtonBase,
  ptButtonHeight,
  ptButtonHeightPx,
} from 'react-blueprintjs-utils';

export const Button = styled.button`
  ${ptButtonBase}
  ${ptButtonHeight(ptButtonHeightPx)}

  &:empty {
    /* override padding from other modifiers (for CSS icon support) */
    padding: 0 !important;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
