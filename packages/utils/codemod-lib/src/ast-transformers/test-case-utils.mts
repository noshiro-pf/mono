export const toUnionAndIntersectionTestCase = ({
  title,
  testCase,
}: Readonly<{
  title: (op: 'Union' | 'Intersection') => string;
  testCase: (op: '|' | '&') => { source: string; expected: string };
}>): readonly Readonly<{
  name: string;
  source: string;
  expected: string;
}>[] =>
  (['|', '&'] as const).map((op) => ({
    name: title(op === '&' ? 'Intersection' : 'Union'),
    ...testCase(op),
  }));
