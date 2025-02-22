import './app.css';
import { reactLogo } from './assets';

const { useCurrentValue: useCount, updateState: updateCount } = createState(0);

const increment = (): void => {
  updateCount((c) => c + 1);
};

export const App = memoNamed('App', () => {
  const count = useCount();

  return (
    <div className={'App'}>
      <div>
        <a href={'https://vitejs.dev'} rel={'noreferrer'} target={'_blank'}>
          <img alt={'Vite logo'} className={'logo'} src={'/vite.svg'} />
        </a>
        <a href={'https://reactjs.org'} rel={'noreferrer'} target={'_blank'}>
          <img alt={'React logo'} className={'logo react'} src={reactLogo} />
        </a>
      </div>
      <h1>{'Vite + React'}</h1>
      <div className={'card'}>
        <button
          data-e2e={'increment-button'}
          type={'button'}
          onClick={increment}
        >{`count is ${count}`}</button>
        <p>
          {'Edit '}
          <code>{'src/app.tsx'}</code>
          {' and save to test HMR'}
        </p>
      </div>
      <p className={'read-the-docs'}>
        {'Click on the Vite and React logos to learn more'}
      </p>
    </div>
  );
});
