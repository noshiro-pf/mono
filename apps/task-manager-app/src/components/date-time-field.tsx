import { memoNamed } from 'preact-utils';
import { lazy, Suspense } from 'preact/compat';

type Props = Readonly<{
  /** The id of the input, unique on the page. */
  id: string;
  label: string;
  /** As the draft holds it: `YYYY-MM-DDTHH:mm`, empty for none. */
  value: string;
  onChange: (value: string) => void;
}>;

/**
 * A labelled date and time, picked with Blueprint's date picker
 * (`date-picker/`), which is loaded the first time a field is shown. Until
 * then an empty input stands in its place.
 */
export const DateTimeField = memoNamed<Props>('DateTimeField', (props) => {
  const { id, label, value, onChange } = props;

  return (
    <div className={'field date-time-field'}>
      <label className={'bp6-label'} htmlFor={id}>
        {label}
      </label>
      <Suspense fallback={LOADING}>
        <DateTimePicker id={id} value={value} onChange={onChange} />
      </Suspense>
    </div>
  );
});

const DateTimePicker = lazy(async () => {
  const { DateTimePicker: component } =
    await import('../date-picker/index.mjs');

  return { default: component };
});

const LOADING = (
  <input
    className={'bp6-input bp6-fill'}
    disabled
    placeholder={'読み込み中…'}
    type={'text'}
  />
);
