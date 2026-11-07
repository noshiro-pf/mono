import { constant, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';

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
      disabled={agreed$.pipe(map((agreed) => !agreed))}
    >
      {constant('Sign up')}
    </button>
  </div>
);
