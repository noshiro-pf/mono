import { useState } from 'better-react-use-state';
import * as React from 'react';

export const MyComponent = (): React.JSX.Element => {
  const [userName, setUserName] = useState('John Doe');

  const [count, , { updateState: updateCount }] = useState(0);

  const onNameChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (ev) => {
        setUserName(ev.target.value);
      },
      [setUserName],
    );

  const incrementCount = React.useCallback(() => {
    updateCount((x) => x + 1);
  }, [updateCount]);

  return (
    <div>
      <p>{`Count: ${count}`}</p>
      <button type={'button'} onClick={incrementCount}>
        {'Increment'}
      </button>

      <p>{`Name: ${userName}`}</p>
      <input type={'text'} value={userName} onChange={onNameChange} />
    </div>
  );
};
