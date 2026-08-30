import styled from '@emotion/styled';

export const InputGroupStyled = styled.div`
  display: block;
  position: relative;
`;

export {
  // 5px space between regular button and large input
  ptButtonHeightPx as inputButtonHeightLargePx,
  // 3px space between small button and regular input
  ptButtonHeightSmallPx as inputButtonHeightPx,
  // 1px space between regular button and small input
  ptButtonHeightSmallerPx as inputButtonHeightSmallPx,
} from '../../constants/index.mjs';
