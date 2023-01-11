import './app.css';
import { preactLogo } from './assets';

export const App = memoNamed('App', () => {
  const { state: count, updateState: updateCount } = useState(0);

  const increment = useCallback(() => {
    updateCount((c) => c + 1);
  }, [updateCount]);

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
        <button type='button' onClick={increment}>{`count is ${count}`}</button>
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
