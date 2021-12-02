import styled from 'styled-components';
import {
  ptButtonHeightPx,
  ptButtonHeightSmallerPx,
  ptButtonHeightSmallPx,
} from '../common';

// 3px space between small button and regular input
export const inputButtonHeightPx = ptButtonHeightSmallPx;
// 5px space between regular button and large input
export const inputButtonHeightLargePx = ptButtonHeightPx;
// 1px space between regular button and small input
export const inputButtonHeightSmallPx = ptButtonHeightSmallerPx;

export const InputGroup = styled.div`
  display: block;
  position: relative;
`;
