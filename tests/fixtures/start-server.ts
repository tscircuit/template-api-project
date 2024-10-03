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

export const startServer = async ({
  port,
  testDbName,
}: { port: number; testDbName: string }) => {
  const client = new Client({
    connectionString: getConnectionStringFromEnv({
      database: "postgres",
    }),
  })
  try {
    await client.connect()
  } catch (e) {
    console.log("Error connecting to postgres")
    throw new Error(
      "Couldn't connect to postgres, make sure you're running postgres in the background with auth_mode=trust. You can run 'docker run -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16'",
    )
  }

  await client.query(`CREATE DATABASE ${testDbName}`)
  await client.end()

  const testDbUrl = getConnectionStringFromEnv({
    database: testDbName,
  })

  await migrate({
    defaultDatabase: testDbName,
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
