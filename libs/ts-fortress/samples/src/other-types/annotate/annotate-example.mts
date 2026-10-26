import * as t from 'ts-fortress';

const Port = t.annotate(t.uint16(8080), {
  title: 'Port',
  description: 'The port the server listens on.',
  examples: [t.asUint16(8080)],
});

assert.isTrue(Port.is(80));

assert.deepStrictEqual(Port.annotations, {
  title: 'Port',
  description: 'The port the server listens on.',
  examples: [8080],
});
