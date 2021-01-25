import React, { useState, useMemo } from 'react';

function App() {
  const name = 'world';

  const [num, setNum] = useState(2);

  const suffix = useMemo(() => new Array(num).fill('!').join(''), [num]);
  const msg = useMemo(() => `${name}${suffix}`, [name, suffix]);

  return (
    <div className='App'>
      <h1>Hello {msg}</h1>
      <button onClick={() => setNum((x) => x + 1)}>{'+1'}</button>
      <button onClick={() => setNum((x) => Math.max(0, x - 1))}>{'-1'}</button>
    </div>
  );
}

export default App;
