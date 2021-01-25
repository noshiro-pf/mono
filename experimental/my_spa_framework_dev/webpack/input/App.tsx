import { useState } from './piko-react';

export const App = () => {
  const [num, , updateNum] = useState<number>(2);

  const suffix = new Array(num).fill('!').join('');
  const msg = `world${suffix}`;

  return (
    <>
      <h1>hello {msg}</h1>
      <button onClick={() => updateNum((x) => x + 1)}>+1</button>
      <button onClick={() => updateNum((x) => Math.max(0, x - 1))}>-1</button>
    </>
  );
};
