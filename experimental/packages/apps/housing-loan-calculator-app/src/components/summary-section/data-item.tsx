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
