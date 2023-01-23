import { hslToStr, type Hsl } from '@noshiro/ts-utils-additional';

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
