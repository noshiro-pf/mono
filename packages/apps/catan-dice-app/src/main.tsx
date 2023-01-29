import { StrictMode } from 'react';
import { render } from 'react-dom';
import { App } from './components';
import './index.css';

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#root')
);
