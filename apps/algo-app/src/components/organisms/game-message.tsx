import type { Bindable, JSX } from 'synstate-dom';

type Props = Readonly<{ message: Bindable<string> }>;

export const GameMessage = ({ message }: Props): JSX.Element => (
  <div>{message}</div>
);
