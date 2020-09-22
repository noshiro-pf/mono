import React, { ReactNode, useState } from 'react';

function component<P, M>(
  model: (props: P) => M,
  postprocess: (model: M) => void,
  view: (model: M) => ReactNode
) {}

interface Props {
  prefix: string;
}

export const App = component(
  (props: Props) => {
    const [num, setNum] = useState(2);
    const suffix = new Array(num).fill('!').join('');
    const msg = `${props.prefix}${suffix}`;
    return { msg, setNum };
  },
  (state) => {},
  (model) => (
    <div className='App'>
      <h1>{model.msg}</h1>
      <button onClick={() => model.setNum((x: number) => x + 1)}>{'+1'}</button>
      <button onClick={() => model.setNum((x: number) => Math.max(0, x - 1))}>
        {'-1'}
      </button>
    </div>
  )
);
