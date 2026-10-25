import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { numberToInput, parseNumberInput } from '../../utils/index.mjs';

/**
 * 入力欄。どれも値の変更は `change`（確定）のときに伝える。`input` のたびに
 * 計算し直すと、入力の途中の値（`0.` など）が書き戻されて打ちにくいため。
 */

export type NumberUnit = 'percent' | 'plain';

type FieldProps<T> = Readonly<{
  label: string;
  value: Bindable<T>;
  onChange: (value: T) => void;
  e2e?: string;
}>;

export const NumberField = ({
  label,
  value,
  onChange,
  unit = 'plain',
  e2e,
}: FieldProps<number> & Readonly<{ unit?: NumberUnit }>): JSX.Element => (
  <label class={constant('field')}>
    <span>{constant(label)}</span>
    <NumberInput
      label={label}
      value={value}
      onChange={onChange}
      unit={unit}
      e2e={e2e}
    />
  </label>
);

/** ラベルを持たない数値の入力欄（表のセル用）。 */
export const NumberInput = ({
  label,
  value,
  onChange,
  unit = 'plain',
  e2e,
}: FieldProps<number> & Readonly<{ unit?: NumberUnit }>): JSX.Element => (
  <input
    type={constant('number')}
    step={constant('any')}
    aria-label={constant(label)}
    data-e2e={e2e === undefined ? undefined : constant(e2e)}
    value={mapBindable(value, (v) =>
      numberToInput(unit === 'percent' ? v * 100 : v),
    )}
    onChange={(e) => {
      const n = parseNumberInput(e.currentTarget.value);

      onChange(unit === 'percent' ? n / 100 : n);
    }}
  />
);

export const TextField = ({
  label,
  value,
  onChange,
  type = 'text',
  e2e,
}: FieldProps<string> & Readonly<{ type?: 'month' | 'text' }>): JSX.Element => (
  <label class={constant('field')}>
    <span>{constant(label)}</span>
    <TextInput
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      e2e={e2e}
    />
  </label>
);

/** ラベルを持たない文字列・年月の入力欄（表のセル用）。 */
export const TextInput = ({
  label,
  value,
  onChange,
  type = 'text',
  e2e,
}: FieldProps<string> & Readonly<{ type?: 'month' | 'text' }>): JSX.Element => (
  <input
    type={constant(type)}
    aria-label={constant(label)}
    data-e2e={e2e === undefined ? undefined : constant(e2e)}
    value={value}
    onChange={(e) => {
      onChange(e.currentTarget.value);
    }}
  />
);

export const CheckboxField = ({
  label,
  value,
  onChange,
  e2e,
}: FieldProps<boolean>): JSX.Element => (
  <label class={constant('field checkbox')}>
    <input
      type={constant('checkbox')}
      data-e2e={e2e === undefined ? undefined : constant(e2e)}
      checked={value}
      onChange={(e) => {
        onChange(e.currentTarget.checked);
      }}
    />
    <span>{constant(label)}</span>
  </label>
);

export const SelectField = <T extends string>({
  label,
  value,
  onChange,
  options,
  e2e,
}: FieldProps<T> &
  Readonly<{
    options: readonly Readonly<{ id: T; label: string }>[];
  }>): JSX.Element => (
  <label class={constant('field')}>
    <span>{constant(label)}</span>
    <select
      data-e2e={e2e === undefined ? undefined : constant(e2e)}
      value={value}
      onChange={(e) => {
        const selectedId = e.currentTarget.value;

        const selected = options.find((o) => o.id === selectedId);

        if (selected !== undefined) {
          onChange(selected.id);
        }
      }}
    >
      {options.map((o) => (
        <option value={constant<string>(o.id)}>{constant(o.label)}</option>
      ))}
    </select>
  </label>
);

/** 計算で導出される値。入力できない表示にする。 */
export const OutputField = ({
  label,
  value,
  e2e,
}: Readonly<{
  label: string;
  value: Bindable<string>;
  e2e?: string;
}>): JSX.Element => (
  <div class={constant('field output')}>
    <span>{constant(label)}</span>
    <output data-e2e={e2e === undefined ? undefined : constant(e2e)}>
      {value}
    </output>
  </div>
);
