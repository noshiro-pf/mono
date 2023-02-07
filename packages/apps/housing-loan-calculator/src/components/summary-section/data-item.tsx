type Props = Readonly<{
  title: string;
  description: string;
}>;

export const DataItem = memoNamed<Props>(
  'DataItem',
  ({ title, description }) => (
    <>
      <dt
        css={css`
          padding: 5px;
        `}
      >
        {title}
      </dt>
      <dd
        css={css`
          padding: 5px;
        `}
      >
        {description}
      </dd>
    </>
  )
);
