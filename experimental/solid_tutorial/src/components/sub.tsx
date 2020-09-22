import { createState, onCleanup } from "solid-js";

export const Sub = () => {
  const [state, setState] = createState<{ count: number }>({ count: 0 });
  const timer = setInterval(() => setState({ count: state.count + 1 }), 1000);
  onCleanup(() => clearInterval(timer));

  return <div>{state.count}</div>;
};
