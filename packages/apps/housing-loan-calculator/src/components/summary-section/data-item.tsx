type Props = Readonly<{
  title: string;
  description: string;
}>;

export const DataItem = memoNamed<Props>(
  'DataItem',
  ({ title, description }) => (
    <>
      <DataTitle>{title}</DataTitle>
      <DataDescription>{description}</DataDescription>
    </>
  )
);

const DataTitle = styled.dt`
  padding: 5px;
`;

const DataDescription = styled.dd`
  padding: 5px;
`;
