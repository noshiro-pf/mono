import { memoNamed } from '@noshiro/react-utils';
import type { Percent } from '@noshiro/ts-utils';
import styled from 'styled-components';
import type { Label } from '../../canvas';
import type { AppEventHandler } from '../event-handlers';
import { LabelButtons } from './label-button';

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
  <Root>
    <LabelButtons
      handlers={props.handlers}
      hidden={props.hidden}
      labelLightness={props.labelsLightness}
      labelSaturation={props.labelsSaturation}
      labels={props.labels}
      selectedLabel={props.selectedLabel}
      visibleLabels={props.visibleLabels}
    />
  </Root>
));

const Root = styled.div`
  width: 100%;
  height: 100%;
  background-color: #5a5a5a;
  color: white;
  padding: 10px;
`;
