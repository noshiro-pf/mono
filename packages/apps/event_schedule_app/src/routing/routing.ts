import { ComponentType } from 'react';
import { AnswerPage } from '../components/pages/answer-page';
import { CreateEventSchedule } from '../components/pages/create-event-schedule';
import { UiPartsTest } from '../components/pages/ui-parts-test';
import { eventIdParamName } from './use-event-id';

export const routePaths = {
  createPage: '/create',
  answerPage: '/event',
  uiParts: '/ui-parts-test',
};

export const routing = {
  createPage: { path: routePaths.createPage, component: CreateEventSchedule },
  answerPage: {
    path: `${routePaths.answerPage}/:${eventIdParamName}`,
    component: AnswerPage,
  },
  uiParts: { path: routePaths.uiParts, component: UiPartsTest },
};

export const routingList: [string, ComponentType][] = [
  routing.createPage,
  routing.answerPage,
  routing.uiParts,
].map((a) => [a.path, a.component]);

export const redirects: [string, string][] = [['/', routePaths.createPage]];
