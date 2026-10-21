import { createState } from 'synstate';
import { constant, type Constant, type JSX } from 'synstate-dom';

// `initial` is read once, when the component is called. Typing it
// `Constant<number>` says so: an observable or a plain number is an error.
const Stepper = ({
  initial,
}: Readonly<{ initial: Constant<number> }>): JSX.Element => {
  const [value$, , { updateState }] = createState<number>(initial);

  return (
    <button
      type={constant('button')}
      onClick={() => {
        updateState((n) => n + 1);
      }}
    >
      {value$}
    </button>
  );
};

export const Form = (): JSX.Element => <Stepper initial={constant(10)} />;
