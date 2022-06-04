import { render } from 'solid-js/web';
import { Main } from './main';

test('renders without crashing', () => {
  const mut_div: Writable<HTMLDivElement> = document.createElement('div');
  const dispose = render(Main, mut_div);
  mut_div.textContent = '';
  dispose();
  expect(true).toBe(true);
});
