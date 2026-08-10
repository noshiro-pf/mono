import { hslToStr } from '@noshiro/ts-utils-additional';
import { type ColorResult } from '../../types';

type Props = Readonly<{
  colorResult: ColorResult;
}>;

export const ColoredDistributionSelected = memoNamed<Props>(
  'ColoredDistributionSelected',
  ({ colorResult }) => {
    const accumulatedDistributionWithStyle = useMemo(
      () =>
        colorResult.accumulatedDistribution.map(([hsl, value]) => ({
          hsl,
          style: {
            height: `${value * 95 + 5}%`,
            backgroundColor: colorResult.pickedUpHues.includes(hsl[0])
              ? hslToStr(hsl)
              : 'transparent',
          },
        })),
      [colorResult.accumulatedDistribution, colorResult.pickedUpHues],
    );

    return (
      <Root>
        {accumulatedDistributionWithStyle.map(({ hsl, style }) => (
          <BarWrapper key={hsl[0]}>
            <Bar style={style} />
          </BarWrapper>
        ))}
      </Root>
    );
  },
);

const Root = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: row;
`;

const Bar = styled.div`
  width: 100%;
  /* border-color: black; */
`;

const BarWrapper = styled.div`
  width: ${100 / 360}%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
