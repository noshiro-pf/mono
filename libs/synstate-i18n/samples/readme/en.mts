import { plural } from 'synstate-i18n';

const p = plural('en');

export const en = {
  title: 'Event schedule',
  greeting: 'Hello, {name}!',
  answers: (params: Readonly<{ count: number }>) =>
    p(params.count, { one: '# answer', other: '# answers' }),
  deadline: { label: 'Answer by {date}' },
} as const;
