import type { Label } from 'pr-report-core-v2';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { labelBackground, labelInk } from '../../domain/index.mjs';
import './common.css';

type Props = Readonly<{ label: Bindable<Label> }>;

/** A label in GitHub's colour, its ink whichever contrasts more. */
export const LabelChip = ({ label }: Props): JSX.Element => (
  <span
    class={constant('label-chip')}
    style={{
      background: mapBindable(label, ({ color }) => labelBackground(color)),
      color: mapBindable(label, ({ color }) => labelInk(color)),
    }}
    title={mapBindable(label, ({ description }) => description)}
  >
    {mapBindable(label, ({ name }) => name)}
  </span>
);
