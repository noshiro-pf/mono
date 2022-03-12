import { render } from 'solid-js/web';
import { Main } from './main';

test('renders without crashing', () => {
  const div = document.createElement('div');
  const dispose = render(Main, div);
  div.textContent = '';
  dispose();
  expect(true).toBe(true);
});
