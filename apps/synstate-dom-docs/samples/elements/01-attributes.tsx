import { createBooleanState, createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [name$, setName] = createState('');

const [agreed$, { toggle: toggleAgreed }] = createBooleanState(false);

export const SignUp = (): JSX.Element => (
  <div id={constant('sign-up')} data-step={constant('1')}>
    {/* `value` and `checked` are written as properties, which is what
        stays in step with the user's input. */}
    <input
      value={name$}
      placeholder={constant('Your name')}
      aria-label={constant('Name')}
      onInput={(event) => {
        setName(event.currentTarget.value);
      }}
    />
    <input
      type={constant('checkbox')}
      checked={agreed$}
      onChange={() => {
        toggleAgreed();
      }}
    />
    {/* A boolean attribute is removed while its value is `false`. */}
    <button
      type={constant('submit')}
      disabled={view(agreed$, (agreed) => !agreed)}
    >
      {constant('Sign up')}
    </button>
  </div>
);
