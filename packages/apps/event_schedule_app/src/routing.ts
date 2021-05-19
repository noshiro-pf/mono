import type { NamedExoticComponent } from 'react';
import { useParams } from 'react-router';

export type EventScheduleAppPages =
  | 'answerPage'
  | 'createPage'
  | 'editPage'
  | 'notFoundPage';

export type EventScheduleAppRoute = Readonly<{
  path: string;
  exact: boolean;
  component: NamedExoticComponent<Readonly<unknown>>;
}>;

export const routePaths = {
  createPage: '/create',
  answerPage: '/event',
  editPageSuffix: '/edit',
  editPage: (eventId: string) =>
    `${routePaths.answerPage}/${eventId}${routePaths.editPageSuffix}`,
  // answerPageTest: '/event-test',
  // uiParts: '/ui-parts-test',
} as const;

export const eventIdParamName = 'id';

export const useEventId = (): string | undefined => {
  const params = useParams<{ [eventIdParamName]: string }>();
  return params[eventIdParamName];
};
