import type { Label } from 'pr-report-core';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { chipColors } from '../label-color.mjs';

type Props = Readonly<{ label: Bindable<Label> }>;

/**
 * One label, in the colour GitHub gives it.
 *
 * The colour is the label's own rather than one of this page's, which is the
 * whole point: a reader who knows what `skip-ci` looks like on GitHub should
 * not have to read the word here.
 */
export const LabelChip = ({ label }: Props): JSX.Element => (
  <span
    class={constant('label-chip')}
    style={{
      'background-color': mapBindable(
        label,
        ({ color }) => chipColors(color).background,
      ),
      'border-color': mapBindable(
        label,
        ({ color }) => chipColors(color).border,
      ),
      color: mapBindable(label, ({ color }) => chipColors(color).text),
    }}
    title={mapBindable(label, ({ name, description }) =>
      description === '' ? name : description,
    )}
  >
    {mapBindable(label, ({ name }) => name)}
  </span>
);
