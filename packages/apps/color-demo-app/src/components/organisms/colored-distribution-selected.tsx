import { hslToStr } from '@noshiro/ts-utils-additional';
import { type ColorResult } from '../../types';

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
  colorResult: ColorResult;
}>;

export const ColoredDistributionSelected = memoNamed<Props>(
  'ColoredDistributionSelected',
  (props) => (
    <Root>
      {props.colorResult.accumulatedDistribution.map(([hsl, value]) => (
        <BarWrapper key={hsl[0]}>
          <Bar
            style={{
              height: `${value * 95 + 5}%`,
              backgroundColor: props.colorResult.pickedUpHues.includes(hsl[0])
                ? hslToStr(hsl)
                : 'transparent',
            }}
          />
        </BarWrapper>
      ))}
    </Root>
  )
);
