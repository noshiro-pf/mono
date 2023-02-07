import { type Hue, type Percent } from '@noshiro/ts-utils-additional';
import { ColorItem } from '../atoms';

type Props = Readonly<{
  hueList: readonly Hue[];
  saturation: Percent;
  lightness: Percent;
}>;

export const ColorList = memoNamed<Props>('ColorList', (props) => (
  <div
    css={css`
      padding: 10px;
    `}
  >
    <div>{'色相リスト'}</div>
    <div
      css={css`
        display: flex;
        flex-direction: row;
        padding: 10px;
      `}
    >
      {props.hueList.map((hue) => (
        <div
          key={hue}
          css={css`
            padding: 3px;
          `}
        >
          <ColorItem hsl={[hue, props.saturation, props.lightness]} />
        </div>
      ))}
    </div>
  </div>
));
