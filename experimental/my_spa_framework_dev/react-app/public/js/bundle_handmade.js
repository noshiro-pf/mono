const append = (target, node) => {
  target.appendChild(node);
};

const insert = (target, node, anchor) => {
  target.insertBefore(node, anchor || null);
};
const detach = (node) => {
  node.parentNode.removeChild(node);
};
const createSpaceElement = () => document.createTextNode(' ');

const listen = (node, event, handler) => {
  node.addEventListener(event, handler);
  return () => node.removeEventListener(event, handler);
};

const runCallbacks = (fns) =>
  fns.forEach((f) => {
    f();
  });

const createReactiveValue = (setter) => {
  const valueRef = { value: setter() };
  const callbacks = [];
  const update = () => {
    valueRef.value = setter();
    runCallbacks(callbacks);
  };
  return [valueRef, update, callbacks];
};

const createState = (init) => {
  const stateRef = {
    value: init,
  };
  const callbacks = [];
  const setter = (next) => {
    stateRef.value = next;
    runCallbacks(callbacks);
  };
  const updater = (fn) => {
    setter(fn(stateRef.value));
  };

  return [stateRef, setter, updater, callbacks];
};

const rootComponent = () => {
  const initialValues = {
    num: 2,
    suffix: '',
    msg: '',
  };

  // elements

  const $h1 = document.createElement('h1');
  const $t0 = document.createTextNode('Hello ');
  const $t1 = document.createTextNode(initialValues.msg);
  const updateText_$t1 = (text) => {
    $t1.data = text;
  };
  const $t2 = createSpaceElement();

  const $button0 = document.createElement('button');
  $button0.textContent = '+1';
  const $t4 = createSpaceElement();
  const $button1 = document.createElement('button');
  $button1.textContent = '-1';

  // states

  const [numRef, setNum, updateNum, numCallbacks] = createState(
    initialValues.num
  );

  const [suffixRef, updateSuffix, suffixCallbacks] = createReactiveValue(() =>
    new Array(numRef.value).fill('!').join('')
  );
  numCallbacks.push(updateSuffix);
  updateSuffix(); // initialize

  const [msgRef, updateMsg, msgCallbacks] = createReactiveValue(
    () => `world${suffixRef.value}`
  );
  msgCallbacks.push(() => updateText_$t1(msgRef.value));
  suffixCallbacks.push(updateMsg);
  updateMsg(); // initialize

  return {
    mount: (target) => {
      insert(target, $h1);
      append($h1, $t0);
      append($h1, $t1);
      insert(target, $t2);
      insert(target, $button0);
      insert(target, $t4);
      insert(target, $button1);

      dispose = [
        listen($button0, 'click', () => {
          updateNum((x) => x + 1);
        }),
        listen($button1, 'click', () => {
          updateNum((x) => Math.max(0, x - 1));
        }),
      ];
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
rootComponent().mount(document.body);
