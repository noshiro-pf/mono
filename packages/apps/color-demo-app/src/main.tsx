import { StrictMode } from 'react';
import { render } from 'react-dom';
import { App } from './app';
import './index.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#root')
);
