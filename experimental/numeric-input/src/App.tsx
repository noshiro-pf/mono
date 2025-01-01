import * as React from 'react';
import { ScoreInputExample } from './score-input-example';

export const App = React.memo(() => (
  <div className='App'>
    <div className='block'>
      <h2>{'Score input (A number between 0 and 1 in increments of 0.1)'}</h2>
      <ScoreInputExample />
    </div>
  </div>
));
