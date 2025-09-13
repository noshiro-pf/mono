// io-ts style
import * as t from 'io-ts';

const User = t.type({
  id: t.string,
  name: t.string,
  age: t.number,
});

type User = t.TypeOf<typeof User>;

// embed-sample-code-ignore-below
export { User };
