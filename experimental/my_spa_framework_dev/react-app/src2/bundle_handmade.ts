export const append = <T extends Node>(target: Node, node: T): T =>
  target.appendChild(node);

export const insert = <T extends Node>(
  target: Node,
  node: T,
  anchor?: Node | null,
): T => target.insertBefore(node, anchor ?? null);

export const detach = <T extends Node>(node: T): void => {
  node.parentNode?.removeChild(node);
};

export const createSpaceElement = (): Text => document.createTextNode(' ');

export const listen = (
  node: HTMLElement,
  event: any,
  handler: (this: HTMLElement, ev: any) => any,
  options?: boolean | AddEventListenerOptions,
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
  setter: () => T,
): [{ value: T }, () => void, CallbackFunction[]] => {
  const valueRef = { value: setter() };
  const callbacks: CallbackFunction[] = [];
  const update = () => {
    valueRef.value = setter();
    runCallbacks(callbacks);
  };
  return [valueRef, update, callbacks];
};

export const createState = <T>(
  init: T,
): [
  { value: T },
  (next: T) => void,
  (fn: (value: T) => T) => void,
  CallbackFunction[],
] => {
  const stateRef = {
    value: init,
  };
  const callbacks: CallbackFunction[] = [];
  const setter = (next: T) => {
    stateRef.value = next;
    runCallbacks(callbacks);
  };
  const updater = (fn: (value: T) => T) => {
    setter(fn(stateRef.value));
  };

  return [stateRef, setter, updater, callbacks];
};

export const App = () => {
  const initialValues = {
    num: 2,
    suffix: '',
    msg: '',
  };

  // elements

  const $h1 = document.createElement('h1');
  const $t0 = document.createTextNode('Hello ');
  const $t1 = document.createTextNode(initialValues.msg);
  const updateText_$t1 = (text: string) => {
    $t1.data = text;
  };
  const $t2 = createSpaceElement();

  const $button0 = document.createElement('button');
  $button0.textContent = '+1';
  const $t4 = createSpaceElement();
  const $button1 = document.createElement('button');
  $button1.textContent = '-1';

  // states

  const [numRef, , updateNum, numCallbacks] = createState(initialValues.num);

  const [suffixRef, updateSuffix, suffixCallbacks] = createReactiveValue(() =>
    new Array(numRef.value).fill('!').join(''),
  );
  numCallbacks.push(updateSuffix);
  updateSuffix(); // initialize

  const [msgRef, updateMsg, msgCallbacks] = createReactiveValue(
    () => `world${suffixRef.value}`,
  );
  msgCallbacks.push(() => updateText_$t1(msgRef.value));
  suffixCallbacks.push(updateMsg);
  updateMsg(); // initialize

  return {
    mount: (target: Node) => {
      insert(target, $h1);
      append($h1, $t0);
      append($h1, $t1);
      insert(target, $t2);
      insert(target, $button0);
      insert(target, $t4);
      insert(target, $button1);

      const dispose = [
        listen($button0, 'click', () => {
          updateNum((x) => x + 1);
        }),
        listen($button1, 'click', () => {
          updateNum((x) => Math.max(0, x - 1));
        }),
      ];

      return { dispose };
    },
  };
};

/**
 * <body>
 *   <h1>Hello world!!</h1>
 *   <button>+1</button>
 *   <button>-1</button>
 * </body>
 */
App().mount(document.body);
