import van from 'vanjs-core';
import type { CounterFramework } from './counter.mjs';

const { button } = van.tags;

export const vanjsCounter: CounterFramework = {
  name: 'VanJS',
  mount: (container) => {
    const mut_count = van.state(0);

    const element = button(
      {
        onclick: () => {
          mut_count.val += 1;
        },
      },
      mut_count,
    );

    van.add(container, element);

    return () => {
      element.remove();
    };
  },
} as const;
