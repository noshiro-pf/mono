import { type Hue, type Percent } from '@noshiro/ts-utils-additional';
import { ColorItem } from '../atoms';

type Props = Readonly<{
  hueList: readonly Hue[];
  saturation: Percent;
  lightness: Percent;
}>;

export const ColorList = memoNamed<Props>('ColorList', (props) => (
  <ColorsWrapper>
    <div>{'色相リスト'}</div>
    <Colors>
      {props.hueList.map((hue) => (
        <ColorItemWrapper key={hue}>
          <ColorItem hsl={[hue, props.saturation, props.lightness]} />
        </ColorItemWrapper>
      ))}
    </Colors>
  </ColorsWrapper>
));

const ColorsWrapper = styled.div`
  padding: 10px;
`;

const Colors = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
`;

const ColorItemWrapper = styled.div`
  padding: 3px;
`;
