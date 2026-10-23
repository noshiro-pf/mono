import { constant, For, type Bindable, type JSX } from 'synstate-dom';

type Props = Readonly<{
  labels: Bindable<readonly string[]>;
}>;

export const LabelChips = ({ labels }: Props): JSX.Element => (
  <span class={constant('label-chips')}>
    <For items={labels} key={(label) => label}>
      {(label$) => (
        <span class={constant('bp6-tag bp6-minimal label-chip')}>{label$}</span>
      )}
    </For>
  </span>
);
