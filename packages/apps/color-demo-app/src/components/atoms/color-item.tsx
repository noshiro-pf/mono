import { hslToStr, type Hsl } from '@noshiro/ts-utils-additional';

type Props = Readonly<{
  hsl: Hsl;
}>;

export const ColorItem = memoNamed<Props>('ColorItem', (props) => (
  <div
    css={css`
      width: 30px;
      height: 30px;
      border-radius: 25%;
    `}
    style={{ backgroundColor: hslToStr(props.hsl) }}
  />
));
