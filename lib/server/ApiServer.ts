import { Kysely, sql } from "kysely"
import { getDbClient } from "lib/db/get-db-client"
import { KyselyDatabaseInstance } from "lib/db/kysely-types"
import { SimpleWorker } from "lib/simple-worker/simple-worker"
import { createWinterSpecBundleFromDir } from "winterspec/adapters/node"
import type { Middleware, WinterSpecRouteBundle } from "winterspec"
import { join } from "node:path"
import { Server } from "bun"

interface ApiServerOptions {
  db?: KyselyDatabaseInstance
  port?: number
}

/**
 * Runs a full API server
 */
export class ApiServer {
  db: KyselyDatabaseInstance
  worker: SimpleWorker
  winterspecBundle?: WinterSpecRouteBundle
  initialized = false
  port: number
  url: string
  bunServer?: Server

  constructor({ db, port }: ApiServerOptions = {}) {
    if (db) {
      this.db = db
    } else {
      this.db = getDbClient()
    }

    this.port = port ?? 3100
    this.url = `http://127.0.0.1:${this.port}`

    this.worker = new SimpleWorker({
      db: this.db,
      baseUrl: this.url,
    })
  }

  async init() {
    this.winterspecBundle = await createWinterSpecBundleFromDir(
      join(import.meta.dir, "../../routes"),
    )

    // Database connection check
    try {
      await sql`SELECT 1`.execute(this.db)
      console.log("Database check passed")
    } catch (e) {
      throw new Error("Failed to connect to database")
    }

    this.initialized = true
  }

  async run() {
    if (!this.initialized) {
      await this.init()
    }

    const middleware: Middleware[] = [
      async (req: any, ctx: any, next: any) => {
        ;(ctx as any).unsafe_db = this.db
        ;(ctx as any).db = this.db
        return next(req, ctx)
      },
      // Override health check to return both server health and worker health
      async (req: any, ctx: any, next: any) => {
        const url = new URL(req.url)
        if (url.pathname === "/health") {
          const is_worker_healthy =
            Date.now() - (this.worker.lastRunStartedAt ?? 0) < 60_000
          return new Response(
            JSON.stringify({
              ok: true,
              merged_health_status: {
                is_worker_healthy,
                is_server_healthy: true,
                last_worker_run_started_at: this.worker.lastRunStartedAt,
              },
            }),
            {
              status: is_worker_healthy ? 200 : 503,
              headers: { "Content-Type": "application/json" },
            },
          )
        }
        return next(req, ctx)
      },
    ]

    this.bunServer = Bun.serve({
      port: this.port,
      fetch: (bunReq) => {
        return this.winterspecBundle!.makeRequest(bunReq, {
          middleware,
        })
      },
    })

    this.worker.run()
  }

  async stop() {
    this.bunServer?.stop()
    this.worker.stop()
  }
}
