import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Num, Result } from 'ts-data-forge';

export const LayoutSlider = ({
  label,
  percent,
  range,
  onInput,
}: Readonly<{
  label: InitializedObservable<string>;
  percent: InitializedObservable<number>;
  /** What the layout takes, so the thumb never goes where nothing applies. */
  range: InitializedObservable<Readonly<{ min: number; max: number }>>;
  onInput: (value: number) => void;
}>): JSX.Element => (
  <label class={constant('slider')}>
    {label}
    <input
      max={range.pipe(map(({ max }) => max.toString()))}
      min={range.pipe(map(({ min }) => min.toString()))}
      type={constant('range')}
      value={percent.pipe(map((p) => p.toString()))}
      onInput={(event) => {
        const next = Num.safeParseFloat(event.currentTarget.value);

        if (Result.isOk(next)) {
          onInput(next.value);
        }
      }}
    />
  </label>
);
