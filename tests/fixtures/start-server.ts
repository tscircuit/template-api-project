import {
  createFetchHandlerFromDir,
  createWinterSpecBundleFromDir,
} from "winterspec/adapters/node"
import { Request as EdgeRuntimeRequest } from "@edge-runtime/primitives"
import { join } from "node:path"
import os from "node:os"
import type { Middleware } from "winterspec"
import { getDbClient } from "lib/db/get-db-client"
import { Client } from "pg"
import { getConnectionStringFromEnv } from "pg-connection-from-env"
import { migrate } from "pgstrap"

export const startServer = async ({ port }: { port: number }) => {
  const client = new Client({
    connectionString: getConnectionStringFromEnv({
      database: "postgres",
    }),
  })
  await client.connect()

  const dbName = `testdb${Math.random().toString(36).substring(2, 15)}`

  const testDbUrl = getConnectionStringFromEnv({
    database: dbName,
  })

  await migrate({
    defaultDatabase: testDbUrl,
    migrationsDir: join(import.meta.dir, "../../lib/db/migrations"),
    cwd: process.cwd(),
    schemas: ["public"],
  })

  // 3. Create a kysely instance
  const db = getDbClient(testDbUrl)

  const winterspecBundle = await createWinterSpecBundleFromDir(
    join(import.meta.dir, "../../routes"),
  )

  const middleware: Middleware[] = [
    async (req: any, ctx: any, next: any) => {
      ;(ctx as any).db = db

      return next(req, ctx)
    },
  ]

  const server = Bun.serve({
    fetch: (bunReq) => {
      const req = new EdgeRuntimeRequest(bunReq.url, {
        headers: bunReq.headers,
        method: bunReq.method,
        body: bunReq.body,
      })
      return winterspecBundle.makeRequest(req as any, {
        middleware,
      })
    },
    port,
  })

  return server
}
