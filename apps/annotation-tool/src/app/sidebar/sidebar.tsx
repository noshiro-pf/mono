import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { type Percent } from 'ts-type-forge';
import { type Label } from '../../canvas/index.mjs';
import { type AppEventHandler } from '../../types/index.mjs';
import { LabelButtons } from './label-button/index.mjs';

type Props = Readonly<{
  labels: readonly Label[];
  labelsSaturation: Percent;
  labelsLightness: Percent;
  visibleLabels: readonly Label[];
  selectedLabel: Label;
  hidden: boolean;
  handlers: AppEventHandler;
}>;

export const Sidebar = memoNamed<Props>('Sidebar', (props) => (
  <div
    css={css`
      width: 100%;
      height: 100%;
      background-color: #5a5a5a;
      color: white;
      padding: 10px;
    `}
  >
    <LabelButtons
      handlers={props.handlers}
      hidden={props.hidden}
      labelLightness={props.labelsLightness}
      labelSaturation={props.labelsSaturation}
      labels={props.labels}
      selectedLabel={props.selectedLabel}
      visibleLabels={props.visibleLabels}
    />
  </div>
));
