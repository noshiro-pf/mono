import { render } from 'react-dom';
// eslint-disable-next-line import/no-unassigned-import,import/no-internal-modules
import './global/globals';
// eslint-disable-next-line import/no-unassigned-import,import/no-internal-modules
import './global/globals-decl';
import './index.css';
import { Main } from './main';
import { unregister } from './serviceWorker';

render(<Main />, document.querySelector('#root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();