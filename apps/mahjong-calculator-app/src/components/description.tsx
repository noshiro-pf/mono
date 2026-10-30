import { constant, type JSX } from 'synstate-dom';

export const Description = (): JSX.Element => (
  <div>{constant('Description')}</div>
);
