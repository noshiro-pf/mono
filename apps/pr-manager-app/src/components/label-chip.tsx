import { type PayloadLabel } from 'pr-report-payload';
import * as React from 'react';
import { chipColors } from '../label-color.mjs';

type Props = Readonly<{ label: PayloadLabel }>;

/**
 * One label, in the colour GitHub gives it.
 *
 * The colour is the label's own rather than one of this page's, which is the
 * whole point: a reader who knows what `skip-ci` looks like on GitHub should
 * not have to read the word here.
 */
export const LabelChip = ({ label }: Props): React.ReactElement => {
  const style = React.useMemo(() => {
    const colors = chipColors(label.color);

    return {
      backgroundColor: colors.background,
      borderColor: colors.border,
      color: colors.text,
    };
  }, [label.color]);

  return (
    <span
      className={'label-chip'}
      style={style}
      title={label.description === '' ? label.name : label.description}
    >
      {label.name}
    </span>
  );
};
