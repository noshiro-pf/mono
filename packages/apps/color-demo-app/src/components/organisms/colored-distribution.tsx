import { hslToStr, type Hsl } from '@noshiro/ts-utils-additional';

type Props = Readonly<{
  accumulatedDistribution: readonly (readonly [Hsl, NonNegativeFiniteNumber])[];
}>;

export const ColoredDistribution = memoNamed<Props>(
  'ColoredDistribution',
  (props) => {
    const accumulatedDistributionWithStyle = useMemo(
      () =>
        props.accumulatedDistribution.map(([hsl, value]) => ({
          hsl,
          style: {
            height: `${value * 100}%`,
            backgroundColor: hslToStr(hsl),
          },
        })),
      [props.accumulatedDistribution],
    );

    return (
      <div
        css={css`
          width: 100%;
          height: 300px;
          display: flex;
          flex-direction: row;
        `}
      >
        {accumulatedDistributionWithStyle.map(({ hsl, style }) => (
          <div
            key={hsl[0]}
            css={css`
              width: ${100 / 360}%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
            `}
          >
            <Bar style={style} />
          </div>
        ))}
      </div>
    );
  },
);

const Bar = styled.div`
  width: 100%;
  /* border-color: black; */
`;
