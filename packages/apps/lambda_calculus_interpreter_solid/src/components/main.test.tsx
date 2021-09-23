import { render } from 'solid-js/web';
import { Main } from './main';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const dispose = render(Main, div);
  div.textContent = '';
  dispose();
});
