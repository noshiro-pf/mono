import { Paper } from '@material-ui/core';
import { memoNamed } from '@mono/react-utils';
import { Hsl, Hue, Mappable, Percent } from '@mono/ts-utils';
import React from 'react';
import styled from 'styled-components';
import { ExperimentResult } from '../../../types/experiment-result';
import { ContrastRatioList } from '../../molecules/contrast-ratio-list';
import { AllSliders } from '../../molecules/saturation-lightness-slider';
import { ColorList } from '../../organisms/color-list';
import { ColoredDistribution } from '../../organisms/colored-distribution';
import { ColoredDistributionSelected } from '../../organisms/colored-distribution-selected';

const Root = styled.div`
  width: 100%;
  height: 100%;
  background-color: #c2c2c2;
  padding: 10px;
`;

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

interface Props {
  saturation: Percent;
  saturationOnChange: (v: Percent) => void;
  lightness: Percent;
  lightnessOnChange: (v: Percent) => void;
  divisionNumber: number;
  divisionNumberOnChange: (v: number) => void;
  firstHue: Hue;
  firstHueOnChange: (v: Hue) => void;
  relativeLuminanceDistribution: Mappable<[Hsl, number]>;
  result1_equallySpaced: ExperimentResult;
  result2_weighted: ExperimentResult;
  result3_weighted_log: ExperimentResult;
}

export const LuminanceVisualizerView = memoNamed<Props>(
  'LuminanceVisualizerView',
  (props) => (
    <Root>
      <PaperCustomized variant='outlined'>
        <AllSliders
          saturation={props.saturation}
          lightness={props.lightness}
          saturationOnChange={props.saturationOnChange}
          lightnessOnChange={props.lightnessOnChange}
          firstHue={props.firstHue}
          firstHueOnChange={props.firstHueOnChange}
          divisionNumber={props.divisionNumber}
          divisionNumberOnChange={props.divisionNumberOnChange}
        />
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>1. 彩度・明度を固定し色相を横軸としたときの相対輝度分布</Title>
        <ColoredDistribution
          accumulatedDistribution={props.relativeLuminanceDistribution}
        />
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>2. 色相環から360/n度ずつ選出した場合</Title>
        <ColoredDistributionSelected
          experimentResult={props.result1_equallySpaced}
        />
        <ColorList
          hueList={props.result1_equallySpaced.pickedUpHues}
          saturation={props.saturation}
          lightness={props.lightness}
        />
        <ContrastRatioList
          contrastRatioList={
            props.result1_equallySpaced.adjacentContrastRatioList
          }
        />
        <Variance>
          コントラスト比の分散：
          {props.result1_equallySpaced.adjacentContrastRatioVariance}
        </Variance>
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>3-a. 相対輝度の変化量の絶対値の累積分布</Title>
        <ColoredDistribution
          accumulatedDistribution={
            props.result2_weighted.accumulatedDistribution
          }
        />
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>3-b. 3-a.の分布の縦軸をn分割した場合の色相</Title>
        <ColoredDistributionSelected
          experimentResult={props.result2_weighted}
        />
        <ColorList
          hueList={props.result2_weighted.pickedUpHues}
          saturation={props.saturation}
          lightness={props.lightness}
        />
        <ContrastRatioList
          contrastRatioList={props.result2_weighted.adjacentContrastRatioList}
        />
        <Variance>
          コントラスト比の分散：
          {props.result2_weighted.adjacentContrastRatioVariance}
        </Variance>
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>4-a. 相対輝度の変化量の絶対値のlogの累積分布</Title>
        <ColoredDistribution
          accumulatedDistribution={
            props.result3_weighted_log.accumulatedDistribution
          }
        />
      </PaperCustomized>

      <PaperCustomized variant='outlined'>
        <Title>4-b. 4-a.の分布の縦軸をn分割した場合の色相</Title>
        <ColoredDistributionSelected
          experimentResult={props.result3_weighted_log}
        />
        <ColorList
          hueList={props.result3_weighted_log.pickedUpHues}
          saturation={props.saturation}
          lightness={props.lightness}
        />
        <ContrastRatioList
          contrastRatioList={
            props.result3_weighted_log.adjacentContrastRatioList
          }
        />
        <Variance>
          コントラスト比の分散：
          {props.result3_weighted_log.adjacentContrastRatioVariance}
        </Variance>
      </PaperCustomized>
    </Root>
  )
);
