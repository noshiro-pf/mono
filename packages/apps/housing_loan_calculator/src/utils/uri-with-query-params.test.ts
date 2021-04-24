import { uriWithQueryParams } from './uri-with-query-params';

const testUri = (
  targetUri: string,
  queryParameters: readonly (readonly [
    string,
    boolean | number | string | undefined
  ])[],
  expectedUri: string
): void => {
  test('equality', () => {
    expect(uriWithQueryParams(targetUri, queryParameters)).toBe(expectedUri);
  });
};

testUri('http://localhost', [['id', 'aaa']], 'http://localhost/?id=aaa');

// test number and boolean (without slash)
testUri(
  'http://localhost',
  [
    ['str', 'string'],
    ['num', 11],
    ['bool', true],
  ],
  'http://localhost/?str=string&num=11&bool=true'
);

// test number and boolean (with slash)
testUri(
  'http://localhost/',
  [
    ['str', 'string'],
    ['num', 11],
    ['bool', true],
  ],
  'http://localhost/?str=string&num=11&bool=true'
);

testUri('http://localhost/', [], 'http://localhost/');
testUri('http://localhost', [], 'http://localhost/');
