import { useState } from 'better-preact-use-state';
import type * as Preact from 'preact';
import { useCallback } from 'preact/hooks';

export const MyComponent = (): Preact.JSX.Element => {
  const [userName, setUserName] = useState('John Doe');

  const [count, , { updateState: updateCount }] = useState(0);

  const onNameInput: Preact.InputEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      setUserName(ev.currentTarget.value);
    },
    [setUserName],
  );

  const incrementCount = useCallback(() => {
    updateCount((x) => x + 1);
  }, [updateCount]);

  return (
    <div>
      <p>{`Count: ${count}`}</p>
      <button type={'button'} onClick={incrementCount}>
        {'Increment'}
      </button>

      <p>{`Name: ${userName}`}</p>
      <input type={'text'} value={userName} onInput={onNameInput} />
    </div>
  );
};
