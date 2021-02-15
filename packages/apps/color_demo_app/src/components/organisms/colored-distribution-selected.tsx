import { memoNamed } from '@noshiro/react-utils';
import { hslToStr } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { ExperimentResult } from '../../types/experiment-result';

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
  experimentResult: ExperimentResult;
}>;

export const ColoredDistributionSelected = memoNamed<Props>(
  'ColoredDistributionSelected',
  (props) => (
    <Root>
      {props.experimentResult.accumulatedDistribution.map(([hsl, value], i) => (
        <BarWrapper key={i}>
          <Bar
            style={{
              height: `${value * 95 + 5}%`,
              backgroundColor: props.experimentResult.pickedUpHues.includes(
                hsl[0]
              )
                ? hslToStr(hsl)
                : 'transparent',
            }}
          />
        </BarWrapper>
      ))}
    </Root>
  )
);
