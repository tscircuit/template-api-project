import { join } from "node:path"
import { migrate } from "pgstrap"
import { KyselyPGlite } from "kysely-pglite"
import { Kysely } from "kysely"
import { afterEach } from "bun:test"
import { Mutex } from "./mutex"
import type { KyselyDatabaseInstance } from "lib/db/kysely-types"

declare global {
  var pgliteMutex: Mutex
  var pgliteInstance: KyselyPGlite
}

export const getTestDatabase = async (opts: { testDbName?: string } = {}) => {
  opts.testDbName ??= `testdb_${Math.random().toString(32).slice(2, 10)}`

  if (!globalThis.pgliteMutex) {
    globalThis.pgliteMutex = new Mutex()
    globalThis.pgliteInstance = await KyselyPGlite.create()
  }
  await globalThis.pgliteMutex.lock()

  const { dialect, client } = globalThis.pgliteInstance

  afterEach(async () => {
    // await client.close()
    globalThis.pgliteMutex.release()
  })

  try {
    await client.query("DROP SCHEMA main CASCADE")
    await client.query("DROP SCHEMA migrations CASCADE")
    await client.query("CREATE SCHEMA main")
    await client.query("CREATE SCHEMA migrations")
  } catch (e) {}

  await migrate({
    client: client as any,
    defaultDatabase: opts.testDbName,
    migrationsDir: join(import.meta.dir, "../../lib/db/migrations"),
    cwd: process.cwd(),
    schemas: ["public"],
  })

  // 3. Create a kysely instance
  const db = new Kysely({
    dialect,
  }) as KyselyDatabaseInstance

  return { dialect, client, db }
}
