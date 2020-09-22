import React, { useEffect, memo } from "react";

export const Sub = memo((props: { count: number; increment: () => void }) => {
  useEffect(() => {
    // props.increment();
  }, [props]);

  return (
    <div>
      <button onClick={props.increment}>yakushin</button>
      <div>{props.count}</div>
    </div>
  );
});
