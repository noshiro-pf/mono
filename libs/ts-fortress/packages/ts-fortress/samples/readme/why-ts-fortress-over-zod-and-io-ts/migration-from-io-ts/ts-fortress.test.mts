// ts-fortress style
import * as t from 'ts-fortress';

const User = t.record({
  id: t.string(),
  name: t.string(),
  age: t.number(20),
});

type User = t.TypeOf<typeof User>;

// embed-sample-code-ignore-below
export { User };
