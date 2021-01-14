import { memoNamed } from '@mono/react-utils';
import { Hsl, hslToStr } from '@mono/ts-utils';
import styled from 'styled-components';

const Box = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 25%;
`;

interface Props {
  hsl: Hsl;
}

export const ColorItem = memoNamed<Props>('ColorItem', (props) => (
  <Box style={{ backgroundColor: hslToStr(props.hsl) }} />
));
