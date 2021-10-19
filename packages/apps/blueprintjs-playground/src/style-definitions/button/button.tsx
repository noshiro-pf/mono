import styled from 'styled-components';
import { ptButtonHeightPx } from '../common';
import { ptButtonBase, ptButtonHeight } from './common';

export const Button = styled.button`
  ${ptButtonBase};
  ${ptButtonHeight(ptButtonHeightPx)};

  &:empty {
    // override padding from other modifiers (for CSS icon support)
    padding: 0 !important;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
