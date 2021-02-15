import { memoNamed } from '@noshiro/react-utils';
import { Hue, Mappable, Percent } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { ColorItem } from '../atoms/color-item';

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

type Props = Readonly<{
  hueList: Mappable<Hue>;
  saturation: Percent;
  lightness: Percent;
}>;

export const ColorList = memoNamed<Props>('ColorList', (props) => (
  <ColorsWrapper>
    <div>色相リスト</div>
    <Colors>
      {props.hueList.map((hue) => (
        <ColorItemWrapper key={hue}>
          <ColorItem hsl={[hue, props.saturation, props.lightness]} />
        </ColorItemWrapper>
      ))}
    </Colors>
  </ColorsWrapper>
));
