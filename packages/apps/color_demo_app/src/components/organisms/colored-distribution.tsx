import { memoNamed } from '@noshiro/react-utils';
import type { Hsl, Mappable } from '@noshiro/ts-utils';
import { hslToStr } from '@noshiro/ts-utils';
import styled from 'styled-components';

const Root = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: row;
`;

const BarWrapper = styled.div`
  width: ${100 / 360}%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const Bar = styled.div`
  width: 100%;
  /* border-color: black; */
`;

type Props = Readonly<{
  accumulatedDistribution: Mappable<readonly [Hsl, number]>;
}>;

export const ColoredDistribution = memoNamed<Props>(
  'ColoredDistribution',
  (props) => (
    <Root>
      {props.accumulatedDistribution.map(([hsl, value]) => (
        <BarWrapper key={hsl[0]}>
          <Bar
            style={{
              height: `${value * 100}%`,
              backgroundColor: hslToStr(hsl),
            }}
          />
        </BarWrapper>
      ))}
    </Root>
  )
);
