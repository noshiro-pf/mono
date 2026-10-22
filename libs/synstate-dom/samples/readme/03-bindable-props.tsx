import { createState } from 'synstate';
import {
  constant,
  mapBindable,
  render,
  type Bindable,
  type JSX,
} from 'synstate-dom';

type BadgeProps = Readonly<{
  label: Bindable<string>;
  count: Bindable<number>;
}>;

// Props are plain values holding bindables, so destructuring them is safe:
// the component is called once and binds what it was given.
const Badge = ({ label, count }: BadgeProps): JSX.Element => (
  <span>
    {label}
    {mapBindable(count, (n) => (n > 99 ? ' (99+)' : ` (${n})`))}
  </span>
);

const [unread$, setUnread] = createState(3);

const Inbox = (): JSX.Element => (
  <nav>
    {/* A constant stays a constant: nothing is subscribed for it. */}
    <Badge label={constant('Inbox')} count={unread$} />
    <Badge label={constant('Archive')} count={constant(120)} />
    <button
      type={constant('button')}
      onClick={() => {
        setUnread(0);
      }}
    >
      {constant('Mark all read')}
    </button>
  </nav>
);

render(Inbox, document.body);
