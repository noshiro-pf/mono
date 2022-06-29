const Keyv = require('keyv');

const LOCAL_DATABASE_URL =
  'postgres://hideaki:X4pBwlNh@localhost:5432/poll-discord-app';

const keyvDb1 = new Keyv(LOCAL_DATABASE_URL, { table: 'db_1' });
const keyvDb2 = new Keyv(LOCAL_DATABASE_URL, { table: 'db_2' });
const keyvDb3 = new Keyv(LOCAL_DATABASE_URL, { table: 'db_3' });

// keyv.on('error', console.error);

(async () => {
  await keyvDb1.set('foo', 'bar');
  const temp = await keyvDb1.get('foo');
  console.log(temp);
})();

(async () => {
  await keyvDb2.set('foo', 'bar');
  const temp = await keyvDb2.get('foo');
  console.log(temp);
})();

(async () => {
  await keyvDb3.set('foo', 'bar');
  const temp = await keyvDb3.get('foo');
  console.log(temp);
})();
