import { constant, type JSX, view } from 'synstate-dom';
import {
  inputAreaString$,
  outputAreaString$,
  setInputAreaString,
} from '../state.mjs';
import * as styles from './app.module.css';
import { CodeArea } from './code-area.js';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)}>
    <h2>{constant('(Untyped) lambda calculus')}</h2>
    <div class={constant(styles.description)}>
      {constant('expr ::= x | (lambda x. expr) | (expr expr)')}
    </div>
    <div class={constant(styles.textAreaWrapper)}>
      <CodeArea
        caption={'Input:'}
        e2eId={'input-area'}
        maxHeightPx={500}
        minHeightPx={100}
        value={inputAreaString$}
        valueChange={setInputAreaString}
      />
    </div>

    <div class={constant(styles.textAreaWrapper)}>
      <CodeArea
        caption={'Output:'}
        e2eId={'output-area'}
        maxHeightPx={800}
        minHeightPx={500}
        value={view(outputAreaString$, (output) => output ?? 'Parse error.')}
      />
    </div>
  </div>
);
