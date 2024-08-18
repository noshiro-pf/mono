import './app.css';
import { preactLogo } from './assets';

const { useCurrentValue: useCount, updateState: updateCount } = createState(0);

const increment = (): void => {
  updateCount((c) => c + 1);
};

export const App = memoNamed('App', () => {
  const count = useCount();

  return (
    <>
      <div>
        <a href='https://vitejs.dev' rel='noreferrer' target='_blank'>
          <img alt='Vite logo' className='logo' src='/vite.svg' />
        </a>
        <a href='https://preactjs.com' rel='noreferrer' target='_blank'>
          <img alt='Preact logo' className='logo preact' src={preactLogo} />
        </a>
      </div>
      <h1>{'Vite + Preact'}</h1>
      <div className='card'>
        <button
          data-cy='increment-button'
          type='button'
          onClick={increment}
        >{`count is ${count}`}</button>
        <p>
          {'Edit '}
          <code>{'src/app.tsx'}</code>
          {' and save to test HMR'}
        </p>
      </div>
      <p className='read-the-docs'>
        {'Click on the Vite and Preact logos to learn more'}
      </p>
    </>
  );
});
