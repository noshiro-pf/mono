import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';

type Props = Readonly<{
  /** The id of the input, unique on the page. */
  id: string;
  label: string;
  /** As the draft holds it: `YYYY-MM-DDTHH:mm`, empty for none. */
  value: Bindable<string>;
  onChange: (value: string) => void;
}>;

/**
 * A labelled date and time to the minute, on the browser's wall clock — what
 * the drafts hold — picked with the browser's own picker, and 「クリア」,
 * which leaves it empty.
 */
export const DateTimeField = ({
  id,
  label,
  value,
  onChange,
}: Props): JSX.Element => (
  <div class={constant('field date-time-field')}>
    <label class={constant('bp6-label')} htmlFor={constant(id)}>
      {constant(label)}
    </label>
    <div class={constant('date-time-input')}>
      <input
        class={constant('bp6-input bp6-fill')}
        id={constant(id)}
        type={constant('datetime-local')}
        value={value}
        onInput={(changed) => {
          onChange(changed.currentTarget.value);
        }}
      />
      <button
        aria-label={constant(`${label}をクリア`)}
        class={constant('bp6-button bp6-minimal')}
        disabled={mapBindable(value, (v) => v === '')}
        type={constant('button')}
        onClick={() => {
          onChange('');
        }}
      >
        {constant('クリア')}
      </button>
    </div>
  </div>
);
