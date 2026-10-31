import { constant, type Child, type JSX } from 'synstate-dom';

type CardProps = Readonly<{
  title: JSX.Element;
  children: Child;
}>;

export const Page = (): JSX.Element => (
  <Card title={<em>{constant('Welcome')}</em>}>
    <p>{constant('Components are plain functions, called once.')}</p>
  </Card>
);

// Children and elements passed as props are descriptions, mounted where the
// component puts them.
const Card = ({ title, children }: CardProps): JSX.Element => (
  <section class={constant('card')}>
    <h2>{title}</h2>
    {children}
  </section>
);
