import { Client } from 'pg';
import { psqlRowId, psqlRowType, psqlTableName } from './constants';
import { databaseDefaultValue, type PsqlClient, type PsqlRow } from './types';

export namespace psql {
  // export const setTlsRejectUnauthorized0 = (): void => {
  //   // eslint-disable-next-line @typescript-eslint/dot-notation,functional/immutable-data
  //   process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  // };

  export const initClient = async (
    connectionString: string | undefined
  ): Promise<Result<PsqlClient, unknown>> => {
    const psqlClient = new Client({
      connectionString,
      ssl: true,
    });

    const res = await Result.fromPromise(psqlClient.connect());

    return Result.isOk(res) ? Result.ok(psqlClient) : Result.err(res.value);
  };

  export const getJsonData = (
    psqlClient: PsqlClient
  ): Promise<Result<PsqlRow, Error>> => {
    const query = `select * from ${psqlTableName};`;
    return new Promise((resolve) => {
      psqlClient.query(query, (error, res) => {
        if (toBoolean(error)) {
          resolve(Result.err(error));
        } else {
          resolve(Result.ok(res.rows[0] as PsqlRow));
        }
      });
    });
  };

  export const setJsonData = (
    psqlClient: PsqlClient,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    jsonData: JSONType
  ): Promise<Result<undefined, JSONValue>> => {
    const query = `update ${psqlTableName} SET ${
      psqlRowType.data
    } = '${Result.unwrapThrow(Json.stringify(jsonData))}', ${
      psqlRowType.updated_at
    } = current_timestamp where ${psqlRowType.id} = '${psqlRowId}';`;
    return new Promise((resolve) => {
      psqlClient.query(query, (error) => {
        if (toBoolean(error)) {
          resolve(Result.err(error as unknown as JSONValue));
        } else {
          resolve(Result.ok(undefined));
        }
      });
    });
  };

  export const hasRecordOfId = (
    psqlClient: PsqlClient,
    recordId: string
  ): Promise<Result<boolean, unknown>> => {
    const query = `select count(*) from ${psqlTableName} where ${psqlRowType.id} = '${recordId}';`;
    return new Promise((resolve) => {
      psqlClient.query(query, (error, res) => {
        if (toBoolean(error)) {
          resolve(Result.err(error));
        } else {
          resolve(
            Result.ok(
              (Str.toNumber((res.rows[0] as { count: string }).count) ?? 0) > 0
            )
          );
        }
      });
    });
  };

  export const createRecord = (
    psqlClient: PsqlClient,
    recordId: string
  ): Promise<Result<undefined, unknown>> => {
    const query = `insert into ${psqlTableName} ( ${psqlRowType.data}, ${
      psqlRowType.updated_at
    }, ${psqlRowType.id} ) values ( '${Result.unwrapThrow(
      Json.stringify({
        polls:
          databaseDefaultValue.polls.toEntriesArray() as unknown as Readonly<
            Record<string, never>
          >[], // TODO
        dateToPollIdMap: databaseDefaultValue.dateToPollIdMap.toEntriesArray(),
        commandMessageIdToPollIdMap:
          databaseDefaultValue.commandMessageIdToPollIdMap.toEntriesArray(),
      })
    )}', current_timestamp, '${recordId}' );`;
    return new Promise((resolve) => {
      psqlClient.query(query, (error) => {
        if (toBoolean(error)) {
          resolve(Result.err(error));
        } else {
          resolve(Result.ok(undefined));
        }
      });
    });
  };

  export const closeConnection = (
    psqlClient: PsqlClient
  ): Promise<Result<void, unknown>> => Result.fromPromise(psqlClient.end());
}
