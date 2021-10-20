import styled from 'styled-components';
import {
  ptButtonBase,
  ptButtonHeight,
} from '../style-definitions/button/common';
import { ptButtonHeightPx } from '../style-definitions/common';

export const Button = styled.button`
  ${ptButtonBase}
  ${ptButtonHeight(ptButtonHeightPx)}

  &:empty {
    // override padding from other modifiers (for CSS icon support)
    padding: 0 !important;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
