import { memoNamed } from '@noshiro/react-utils';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import {
  AnswerPage,
  CreateEventSchedule,
  EditEventSchedule,
  Footer,
  NotFoundPage,
} from './components';
import type { EventScheduleAppPages, EventScheduleAppRoute } from './routing';
import { eventIdParamName, routePaths } from './routing';
// import { UiPartsTest } from '../components/pages/ui-parts-test';

const routes: Readonly<Record<EventScheduleAppPages, EventScheduleAppRoute>> = {
  createPage: {
    path: routePaths.createPage,
    exact: true,
    component: CreateEventSchedule,
  },
  answerPage: {
    path: `${routePaths.answerPage}/:${eventIdParamName}`,
    exact: true,
    component: AnswerPage,
  },
  editPage: {
    path: `${routePaths.answerPage}/:${eventIdParamName}${routePaths.editPageSuffix}`,
    exact: true,
    component: EditEventSchedule,
  },
  notFoundPage: {
    path: '*',
    exact: false,
    component: NotFoundPage,
  },
  // answerPageTest: {
  //   path: `${routePaths.answerPageTest}/:${eventIdParamName}`,
  //   component: AnswerPage,
  // },
  // uiParts: { path: routePaths.uiParts, component: UiPartsTest },
};

const routeList: readonly EventScheduleAppRoute[] = [
  routes.createPage,
  routes.answerPage,
  routes.editPage,
  routes.notFoundPage,
  // routing.answerPageTest,
  // routing.uiParts,
];

const redirects: readonly (readonly [string, string])[] = [
  ['/', routePaths.createPage],
];

export const Main = memoNamed('Main', () => (
  <Root>
    <BrowserRouter>
      <Switch>
        {redirects.map(([from, to]) => (
          <Route key={from} exact={true} path={from}>
            <Redirect to={to} />
          </Route>
        ))}
        {routeList.map(({ path, exact, component }) => (
          <Route key={path} component={component} exact={exact} path={path} />
        ))}
      </Switch>
    </BrowserRouter>
    <Footer />
  </Root>
));

const Root = styled.div`
  min-height: 100vh;
`;
