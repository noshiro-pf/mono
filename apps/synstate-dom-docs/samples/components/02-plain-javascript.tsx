import { createState } from 'synstate';
import {
  constant,
  derive,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';

type CountedTextAreaProps = Readonly<{
  label: Bindable<string>;
  value: Bindable<string>;
  onInput: (value: string) => void;
  maxLength?: Bindable<number>;
}>;

type FieldProps = Readonly<{ hint: Bindable<string> }> & CountedTextAreaProps;

export const Compose = (): JSX.Element => (
  <Field
    label={constant('Message')}
    hint={constant('Plain text only.')}
    value={draft$}
    onInput={setDraft}
  />
);

// A helper takes bindables and returns one, like any other function.
const remainingOf = (
  value: Bindable<string>,
  maxLength: Bindable<number>,
): Bindable<number> => derive([value, maxLength], (v, max) => max - v.length);

// A component called only while its branch is mounted, so its text is
// derived only while it is shown.
const CharactersLeft = ({
  count,
}: Readonly<{ count: Bindable<number> }>): JSX.Element => (
  <small>{mapBindable(count, (n) => `${n} characters left`)}</small>
);

const CountedTextArea = ({
  label,
  value,
  onInput,
  // A default is a destructuring default.
  maxLength = constant(140),
}: CountedTextAreaProps): JSX.Element => {
  // Computed in the component body and kept in a variable, and it still
  // updates: `remaining` is a bindable derived from the props, not a number
  // read once.
  const remaining = remainingOf(value, maxLength);

  return (
    <span>
      <label>
        {label}
        <textarea
          value={value}
          onInput={(event) => {
            onInput(event.currentTarget.value);
          }}
        />
      </label>
      {/* The price: a derived value that updates is built as a bindable,
          and an element shown depending on an updating value is `If`,
          not `&&` or `? :`. */}
      <If
        cond={mapBindable(remaining, (n) => n < 0)}
        then={<strong>{constant('Too long')}</strong>}
        else={<CharactersLeft count={remaining} />}
      />
    </span>
  );
};

// The props this component does not use itself are forwarded with a rest
// pattern.
const Field = ({ hint, ...textArea }: FieldProps): JSX.Element => (
  <div>
    <CountedTextArea {...textArea} />
    <p>{hint}</p>
  </div>
);

const [draft$, setDraft] = createState('');
