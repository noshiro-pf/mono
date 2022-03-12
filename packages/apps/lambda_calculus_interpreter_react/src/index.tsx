import { render } from 'react-dom';
import { Main } from './components';
import './index.css';
import { unregister } from './serviceWorker';

render(<Main />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();
