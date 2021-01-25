import {
  createText,
  setContent,
  createElement,
  append,
  addPropTransaction,
  propUpdater,
} from 'vidact/runtime';
/*--- Import Vidact Runtime Helpers ---*/

function App() {
  const __internal_state = { _s: 0 };

  const __props_transactions = new Map();

  let counter, handleIncrement, handleDecrement;

  const setCounter = (value) => {
    updateState({ _s: value });
  };

  const _executer = () => {
    counter = __internal_state._s;
  };

  _executer();

  const _executer2 = () => {
    handleIncrement = () => setCounter(counter + 1);
  };

  _executer2();

  const _executer3 = () => {
    handleDecrement = () => setCounter(counter - 1);
  };

  _executer3();

  let _el_4 = createText('Current count is ');

  let _el_5;

  const _el_5_update = () => {
    if (!_el_5) _el_5 = createText();
    _el_5.element = setContent(_el_5.element, counter);
  };

  _el_5_update();

  let _el_3 = createElement('p');

  append(_el_3, _el_4, _el_5);

  let _el_6 = createText(' ');

  let _el_8 = createText('+ Increment ');

  let _el_7 = createElement('button', {
    onClick: handleIncrement,
  });

  const _executer4 = () => {
    addPropTransaction(__props_transactions, _el_7, 'onClick', handleIncrement);
  };

  _executer4();

  append(_el_7, _el_8);

  let _el_9 = createText(' ');

  let _el_11 = createText('- Decrement ');

  let _el_10 = createElement('button', {
    onClick: handleDecrement,
  });

  const _executer5 = () => {
    addPropTransaction(
      __props_transactions,
      _el_10,
      'onClick',
      handleDecrement
    );
  };

  _executer5();

  append(_el_10, _el_11);

  let _el_ = createElement('div');

  append(_el_, _el_3, _el_6, _el_7, _el_9, _el_10);
  const updateState = propUpdater(
    __internal_state,
    [_executer, _executer2, _executer3, _el_5_update, _executer4, _executer5],
    [
      [
        '_s',
        [
          /*_executer*/ 0,
          /*_executer2*/ 1,
          /*_executer4*/ 4,
          /*_executer3*/ 2,
          /*_executer5*/ 5,
          /*_el_5_update*/ 3,
        ],
      ],
    ],
    false,
    __props_transactions
  );
  return {
    element: _el_,
    updateProps: () => {},
  };
}

document.body.innerHTML = '';
document.body.append(App({}).element.element);
