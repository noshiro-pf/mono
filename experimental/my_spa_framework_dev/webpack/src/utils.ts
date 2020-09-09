export const append = <T extends Node>(target: Node, node: T): T =>
  target.appendChild(node);

export const insert = <T extends Node>(
  target: Node,
  node: T,
  anchor?: Node | null
): T => target.insertBefore(node, anchor ?? null);

export const detach = <T extends Node>(node: T): void => {
  node.parentNode?.removeChild(node);
};

export const createSpaceElement = (): Text => document.createTextNode(" ");

export const listen = (
  node: HTMLElement,
  event: any,
  handler: (this: HTMLElement, ev: any) => any,
  options?: boolean | AddEventListenerOptions
): (() => void) => {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
};

export type CallbackFunction = (...args: any[]) => void;

export const runCallbacks = (fns: CallbackFunction[]) =>
  fns.forEach((f) => {
    f();
  });

export const createReactiveValue = <T>(
  setter: () => T
): [{ value: T }, () => void, CallbackFunction[]] => {
  const valueRef = { value: setter() };
  const onValueChangeFns: CallbackFunction[] = [];
  const update = () => {
    valueRef.value = setter();
    runCallbacks(onValueChangeFns);
  };
  return [valueRef, update, onValueChangeFns];
};

export const createState = <T>(
  init: T
): [
  { value: T },
  (next: T) => void,
  (fn: (value: T) => T) => void,
  CallbackFunction[]
] => {
  const stateRef = {
    value: init,
  };
  const onStateChangeFns: CallbackFunction[] = [];
  const setter = (next: T) => {
    stateRef.value = next;
    runCallbacks(onStateChangeFns);
  };
  const updater = (fn: (value: T) => T) => {
    setter(fn(stateRef.value));
  };

  return [stateRef, setter, updater, onStateChangeFns];
};
