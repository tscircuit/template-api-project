import { getDbClient } from "lib/db/get-db-client"
import type { KyselyDatabaseInstance } from "lib/db/kysely-types"
import type { Middleware } from "winterspec"

export const withDb: Middleware<
  {},
  {
    db: KyselyDatabaseInstance
  }
> = async (req, ctx, next) => {
  if (!ctx.db) {
    ctx.db = await getDbClient()
  }
  return next(req, ctx)
}
