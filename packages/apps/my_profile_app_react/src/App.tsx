import { memoNamed } from '@noshiro/react-utils';
import Media from 'react-media';
import { BrowserRouter } from 'react-router-dom';
import { AppSub } from './App-view';

const query = { maxWidth: 800 } as const;

export const App = memoNamed('App', () => (
  <BrowserRouter>
    <Media query={query}>{(matches) => <AppSub mobile={matches} />}</Media>
  </BrowserRouter>
));
