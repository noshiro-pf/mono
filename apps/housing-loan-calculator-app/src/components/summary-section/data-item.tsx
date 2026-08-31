import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { type DeepReadonly } from 'ts-type-forge';

type Props = DeepReadonly<{
  title: string;
  description: string;
  cyIdForTitle?: string;
  cyIdForDescription?: string;
}>;

export const DataItem = memoNamed<Props>(
  'DataItem',
  ({ title, description, cyIdForTitle, cyIdForDescription }) => (
    <>
      <dt
        css={css`
          padding: 5px;
        `}
        data-e2e={cyIdForTitle}
      >
        {title}
      </dt>
      <dd
        css={css`
          padding: 5px;
        `}
        data-e2e={cyIdForDescription}
      >
        {description}
      </dd>
    </>
  ),
);
