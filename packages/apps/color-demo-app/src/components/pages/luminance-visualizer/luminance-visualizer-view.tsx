import { Paper } from '@mui/material';
import { type Hsl, type Hue } from '@noshiro/ts-utils-additional';
import { type ColorResult, type DivisionNumber } from '../../../types';
import { AllSliders, ContrastRatioList } from '../../molecules';
import {
  ColorList,
  ColoredDistribution,
  ColoredDistributionSelected,
} from '../../organisms';

type Props = Readonly<{
  saturation: Percent;
  saturationOnChange: (v: Percent) => void;
  lightness: Percent;
  lightnessOnChange: (v: Percent) => void;
  divisionNumber: DivisionNumber;
  divisionNumberOnChange: (v: DivisionNumber) => void;
  firstHue: Hue;
  firstHueOnChange: (v: Hue) => void;
  relativeLuminanceDistribution: readonly (readonly [
    Hsl,
    NonNegativeFiniteNumber,
  ])[];
  result1_equallySpaced: ColorResult;
  result2_weighted: ColorResult;
  result3_weighted_log: ColorResult;
}>;

export const LuminanceVisualizerView = memoNamed<Props>(
  'LuminanceVisualizerView',
  (props) => (
    <div
      css={css`
        width: 100%;
        height: 100%;
        background-color: #c2c2c2;
        padding: 10px;
      `}
    >
      <PaperCustomized variant='outlined'>
        <AllSliders
          divisionNumber={props.divisionNumber}
          divisionNumberOnChange={props.divisionNumberOnChange}
          firstHue={props.firstHue}
          firstHueOnChange={props.firstHueOnChange}
          lightness={props.lightness}
          lightnessOnChange={props.lightnessOnChange}
          saturation={props.saturation}
          saturationOnChange={props.saturationOnChange}
        />
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>
          {'1. 彩度・明度を固定し色相を横軸としたときの相対輝度分布'}
        </Title>
        <ColoredDistribution
          accumulatedDistribution={props.relativeLuminanceDistribution}
        />
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>{'2. 色相環から360/n度ずつ選出した場合'}</Title>
        <ColoredDistributionSelected
          colorResult={props.result1_equallySpaced}
        />
        <ColorList
          hueList={props.result1_equallySpaced.pickedUpHues}
          lightness={props.lightness}
          saturation={props.saturation}
        />
        <ContrastRatioList
          contrastRatioList={
            props.result1_equallySpaced.adjacentContrastRatioList
          }
        />
        <Variance>
          {'コントラスト比の分散：'}
          {props.result1_equallySpaced.adjacentContrastRatioVariance}
        </Variance>
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>{'3-a. 相対輝度の変化量の絶対値の累積分布'}</Title>
        <ColoredDistribution
          accumulatedDistribution={
            props.result2_weighted.accumulatedDistribution
          }
        />
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>{'3-b. 3-a.の分布の縦軸をn分割した場合の色相'}</Title>
        <ColoredDistributionSelected colorResult={props.result2_weighted} />
        <ColorList
          hueList={props.result2_weighted.pickedUpHues}
          lightness={props.lightness}
          saturation={props.saturation}
        />
        <ContrastRatioList
          contrastRatioList={props.result2_weighted.adjacentContrastRatioList}
        />
        <Variance>
          {'コントラスト比の分散：'}
          {props.result2_weighted.adjacentContrastRatioVariance}
        </Variance>
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>{'4-a. 相対輝度の変化量の絶対値のlogの累積分布'}</Title>
        <ColoredDistribution
          accumulatedDistribution={
            props.result3_weighted_log.accumulatedDistribution
          }
        />
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>{'4-b. 4-a.の分布の縦軸をn分割した場合の色相'}</Title>
        <ColoredDistributionSelected colorResult={props.result3_weighted_log} />
        <ColorList
          hueList={props.result3_weighted_log.pickedUpHues}
          lightness={props.lightness}
          saturation={props.saturation}
        />
        <ContrastRatioList
          contrastRatioList={
            props.result3_weighted_log.adjacentContrastRatioList
          }
        />
        <Variance>
          {'コントラスト比の分散：'}
          {props.result3_weighted_log.adjacentContrastRatioVariance}
        </Variance>
      </PaperCustomized>
    </div>
  ),
);

const PaperCustomized = styled(Paper)`
  margin-top: 10px;
  padding: 10px;
`;

const Title = styled.h1`
  font-size: larger;
`;

const Variance = styled.div`
  padding: 10px;
`;
