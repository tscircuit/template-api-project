import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import pgmConfig from "../../pgstrap.config.js"
import { KyselyDatabaseInstance } from "./kysely-types.js"
import { getConnectionStringFromEnv } from "pg-connection-from-env"

export const getDbClient = (
  connectionString?: string,
): KyselyDatabaseInstance => {
  return new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString:
          connectionString ??
          getConnectionStringFromEnv({
            fallbackDefaults: {
              database: pgmConfig.defaultDatabase,
            },
          }),
      }),
    }),
  })
}
