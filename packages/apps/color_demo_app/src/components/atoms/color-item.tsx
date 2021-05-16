import { memoNamed } from '@noshiro/react-utils';
import type { Hsl } from '@noshiro/ts-utils';
import { hslToStr } from '@noshiro/ts-utils';
import styled from 'styled-components';

const Box = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 25%;
`;

type Props = Readonly<{
  hsl: Hsl;
}>;

export const ColorItem = memoNamed<Props>('ColorItem', (props) => (
  <Box style={{ backgroundColor: hslToStr(props.hsl) }} />
));
