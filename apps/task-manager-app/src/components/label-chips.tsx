import { memoNamed } from 'preact-utils';

type Props = Readonly<{
  labels: readonly string[];
}>;

export const LabelChips = memoNamed<Props>('LabelChips', (props) => {
  const { labels } = props;

  return (
    <span className={'label-chips'}>
      {labels.map((label) => (
        <span key={label} className={'bp6-tag bp6-minimal label-chip'}>
          {label}
        </span>
      ))}
    </span>
  );
});
