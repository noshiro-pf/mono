import { psqlRowId } from './constants';
import { initDiscordClient, startDiscordListener } from './discord';
import { DATABASE_URL, isDev } from './env';
import { initializeInMemoryDatabase } from './in-memory-database';
import { psql } from './postgre-sql';
import type { DatabaseRef } from './types';
import { databaseDefaultValue } from './types';

export const main = async (): Promise<Result<unknown, unknown>> => {
  psql.setTlsRejectUnauthorized0();

  const mut_databaseRef: DatabaseRef = {
    db: databaseDefaultValue,
  };

  const [psqlClientResult, discordClientResult] = await Promise.all([
    psql.initClient(isDev ? undefined : DATABASE_URL),
    initDiscordClient(),
  ]);

  if (Result.isErr(psqlClientResult)) {
    console.error('initPsqlClient failed.', psqlClientResult.value);
    return psqlClientResult;
  }
  if (Result.isErr(discordClientResult)) {
    console.error('initDiscordClient failed.', discordClientResult.value);
    return discordClientResult;
  }

  const psqlClient = psqlClientResult.value;
  console.log('PostgreSQL client is ready!');

  const discordClient = discordClientResult.value;
  console.log('Discord client is ready!');

  // initialize psql database
  const hasRecordOfIdResult = await psql.hasRecordOfId(psqlClient, psqlRowId);
  if (Result.isErr(hasRecordOfIdResult)) {
    console.error(
      'psql.hasRecordOfId check failed.',
      hasRecordOfIdResult.value
    );
    return hasRecordOfIdResult;
  }

  if (!hasRecordOfIdResult.value) {
    const res = await psql.createRecord(psqlClient, psqlRowId);
    if (Result.isErr(res)) {
      console.error('psql.createRecord failed.', res.value);
      return res;
    }
    console.log(`created record with id ${psqlRowId}`);
  }

  const initDbResult = await initializeInMemoryDatabase(
    mut_databaseRef,
    psqlClient
  );

  if (Result.isErr(initDbResult)) {
    console.error('initDbResult failed.', initDbResult.value);
    return initDbResult;
  }
  console.log('In-Memory DB is ready');

  startDiscordListener(discordClient, psqlClient, mut_databaseRef);

  return Result.ok(undefined);
};
