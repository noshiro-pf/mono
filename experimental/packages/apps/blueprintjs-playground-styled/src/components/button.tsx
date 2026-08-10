import {
  ptButtonBase,
  ptButtonHeight,
  ptButtonHeightPx,
} from '../style-definitions';

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
