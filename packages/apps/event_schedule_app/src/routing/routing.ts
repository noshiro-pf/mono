import { ComponentType } from 'react';
import { AnswerPage } from '../components/pages/answer-page/answer-page';
import { CreateEventSchedule } from '../components/pages/create-event-schedule/create-event-schedule';
import { EditEventSchedule } from '../components/pages/create-event-schedule/edit-event-schedule';
import { UiPartsTest } from '../components/pages/ui-parts-test';
import { eventIdParamName } from './use-event-id';

export const routePaths = {
  createPage: '/create',
  answerPage: '/event',
  editPageSuffix: '/edit',
  editPage: (eventId: string) =>
    `${routePaths.answerPage}/${eventId}${routePaths.editPageSuffix}`,
  uiParts: '/ui-parts-test',
} as const;

export const routing = {
  createPage: { path: routePaths.createPage, component: CreateEventSchedule },
  answerPage: {
    path: `${routePaths.answerPage}/:${eventIdParamName}`,
    component: AnswerPage,
  },
  editPage: {
    path: `${routePaths.answerPage}/:${eventIdParamName}${routePaths.editPageSuffix}`,
    component: EditEventSchedule,
  },
  uiParts: { path: routePaths.uiParts, component: UiPartsTest },
};

export const routingList: readonly [string, ComponentType][] = [
  routing.createPage,
  routing.answerPage,
  routing.editPage,
  routing.uiParts,
].map((a) => [a.path, a.component]);

export const redirects: [string, string][] = [['/', routePaths.createPage]];
