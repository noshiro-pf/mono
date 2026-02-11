import * as React from 'react';
import { noop } from './noop.mjs';

{
  const obj = { a: 1, b: 2, c: 3 };

  // @check-destructuring-completeness
  // eslint-disable-next-line ts-restrictions/check-destructuring-completeness
  const { a, b } = obj;

  noop(a, b);

  // eslint-disable-next-line unicorn/consistent-destructuring
  noop(obj.c);
}

{
  const obj: { a: number; b: string; c: boolean } = {
    a: 1,
    b: 'hello',
    c: true,
  };

  // @check-destructuring-completeness
  // eslint-disable-next-line ts-restrictions/check-destructuring-completeness
  const { a, b } = obj;

  noop(a, b);

  // eslint-disable-next-line unicorn/consistent-destructuring
  noop(obj.c);
}

type Props = Readonly<{
  foo: number;
  bar: string;
}>;

// eslint-disable-next-line react-refresh/only-export-components
const PropsDestructuring = React.memo<Props>((props) => {
  // eslint-disable-next-line ts-restrictions/check-destructuring-completeness
  const { foo } = props;

  return <div>{foo}</div>;
});

PropsDestructuring.displayName = 'PropsDestructuring';
