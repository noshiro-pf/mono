import { hslToStr } from '@noshiro/ts-utils-additional';
import { type ColorResult } from '../../types';

type Props = Readonly<{
  colorResult: ColorResult;
}>;

export const ColoredDistributionSelected = memoNamed<Props>(
  'ColoredDistributionSelected',
  (props) => (
    <div
      css={css`
        width: 100%;
        height: 300px;
        display: flex;
        flex-direction: row;
      `}
    >
      {props.colorResult.accumulatedDistribution.map(([hsl, value]) => (
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
          <Bar
            style={{
              height: `${value * 95 + 5}%`,
              backgroundColor: props.colorResult.pickedUpHues.includes(hsl[0])
                ? hslToStr(hsl)
                : 'transparent',
            }}
          />
        </div>
      ))}
    </div>
  ),
);

const Bar = styled.div`
  width: 100%;
  /* border-color: black; */
`;
