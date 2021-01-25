import {
  append,
  createReactiveValue,
  createSpaceElement,
  createState,
  insert,
  listen,
} from './utils';

/**
 * <body>
 *   <h1>Hello world!!</h1>
 *   <button>+1</button>
 *   <button>-1</button>
 * </body>
 */
export const App = () => {
  // elements

  const $h1 = document.createElement('h1');
  const $t0 = document.createTextNode('Hello ');
  const $t1 = document.createTextNode('');
  const updateText_$t1 = (text: string) => {
    $t1.data = text;
  };
  const $t2 = createSpaceElement();

  const $button0 = document.createElement('button');
  $button0.textContent = '+1';
  const $t3 = createSpaceElement();
  const $button1 = document.createElement('button');
  $button1.textContent = '-1';

  // states

  const [numRef, , updateNum, onNumChangeFns] = createState(2);

  const [suffixRef, updateSuffix, onSuffixChangeFns] = createReactiveValue(() =>
    new Array(numRef.value).fill('!').join('')
  );
  onNumChangeFns.push(updateSuffix);
  updateSuffix(); // initialize

  const [msgRef, updateMsg, onMsgChangeFns] = createReactiveValue(
    () => `world${suffixRef.value}`
  );
  onMsgChangeFns.push(() => updateText_$t1(msgRef.value));
  onSuffixChangeFns.push(updateMsg);
  updateMsg(); // initialize

  return {
    mount: (target: Node) => {
      insert(target, $h1);
      append($h1, $t0);
      append($h1, $t1);
      insert(target, $t2);
      insert(target, $button0);
      insert(target, $t3);
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
