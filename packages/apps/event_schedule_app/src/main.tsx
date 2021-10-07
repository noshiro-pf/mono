import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import {
  AnswerPage,
  CreateEventSchedule,
  EditEventSchedule,
  Footer,
  NotFoundPage,
} from './components';
import { redirectRules } from './constants';
import { router, useShowPage } from './store';

router.pathname$.subscribe((pathname) => {
  const to = redirectRules.get(pathname);
  if (to !== undefined) {
    router.redirect(to);
  }
});

export const Main = memoNamed('Main', () => {
  const show = useShowPage();

  return (
    <Root>
      {show.createPage ? (
        <CreateEventSchedule />
      ) : show.editPage ? (
        <EditEventSchedule />
      ) : show.answerPage ? (
        <AnswerPage />
      ) : (
        <NotFoundPage />
      )}
      <Footer />
    </Root>
  );
});

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
