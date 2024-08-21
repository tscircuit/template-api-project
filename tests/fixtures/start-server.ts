import {
  createFetchHandlerFromDir,
  createWinterSpecBundleFromDir,
} from "winterspec/adapters/node"
import { Request as EdgeRuntimeRequest } from "@edge-runtime/primitives"
import { join } from "node:path"
import { ZodLevelDatabase } from "api/db/zod-level-db"
import os from "node:os"
import type { Middleware } from "winterspec"
import { getDbClient } from "lib/db/get-db-client"

export const startServer = async ({ port }: { port: number }) => {
  const dbName = `test${Math.random().toString(36).substring(2, 15)}`
  // 1. CREATE DATABASE
  // 2. Migrate a database
  // 3. Create a kysely instance
  const db = getDbClient()

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
