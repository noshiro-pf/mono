import { StrictMode } from 'react';
import { render } from 'react-dom';
import { App } from './app';
import './index.css';

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#root')
);

// TODO: uncomment this after updating to React 18
// import { createRoot } from 'react-dom/client';
// // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// createRoot(document.querySelector('#root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );

/*
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
  },
  "devDependencies": {
    "@types/react": "^18.0.26",
    "@types/react-dom": "^18.0.10"
  }
 */
