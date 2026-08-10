import { memo } from 'react';

type Props = Readonly<{
  foo: number;
  bar: string;
}>;

// eslint-disable-next-line react-refresh/only-export-components
const PropsDestructuring = memo<Props>((props) => {
  // eslint-disable-next-line ts-restrictions/check-destructuring-completeness
  const { foo } = props;

  return <div>{foo}</div>;
});

PropsDestructuring.displayName = 'PropsDestructuring';
