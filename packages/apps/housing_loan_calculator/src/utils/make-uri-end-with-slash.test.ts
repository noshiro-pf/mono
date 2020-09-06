import { makeUriEndWithSlash } from './make-uri-end-with-slash';

const testUri = (targetUri: string, expectedUri: string): void => {
  test('equality', () => {
    expect(targetUri).toBe(expectedUri);
  });
};

testUri(makeUriEndWithSlash('http://localhost'), 'http://localhost/');
testUri(makeUriEndWithSlash('http://localhost/'), 'http://localhost/');
