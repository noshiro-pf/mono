import { AnchorButton, Button } from '@blueprintjs/core';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const buttonCssOverflowHidden = css`
  max-width: 100%;
  overflow-x: hidden;

  & > span {
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
`;

export const BpButtonOverflowHidden = styled(Button)`
  ${buttonCssOverflowHidden}
`;

export const BpAnchorButtonOverflowHidden = styled(AnchorButton)`
  ${buttonCssOverflowHidden}
`;
