import defaultKy from "ky"
import { KyselyDatabaseInstance } from "lib/db/kysely-types"

interface SimpleWorkerOptions {
  db: KyselyDatabaseInstance
  baseUrl: string
}

interface Job {
  workEndpoint: string
  payload: any
}

export class SimpleWorker {
  continuouslyRunning = false
  db: KyselyDatabaseInstance
  baseUrl: string
  lastRunStartedAt: number | null

  constructor({ db, baseUrl }: SimpleWorkerOptions) {
    this.db = db
    this.baseUrl = baseUrl ?? process.env.REGISTRY_API_URL
    this.lastRunStartedAt = null
  }

  async _findJobsToDo(): Promise<Job[]> {
    return [
      // {
      //   workEndpoint: "internal/autorouting/update_all_jobs",
      //   payload: {},
      // },
    ]
  }

  async _doJob(job: Job) {
    const ky = defaultKy.create({
      prefixUrl: this.baseUrl,
      headers: {
        "worker-authorization": `Bearer ${process.env.WORKER_AUTH_TOKEN}`,
      },
    })

    const res = await ky.post(job.workEndpoint, {
      json: job.payload,
    })

    if (!res.ok) {
      console.error("Failed to do job", {
        job,
        status: res.status,
        body: await res.text(),
      })
    }
  }

  async runOnce() {
    this.lastRunStartedAt = Date.now()
    const jobs = await this._findJobsToDo()
    if (process.env.FLY_APP_NAME) {
      console.log(`Found ${jobs.length} jobs to do`)
    }

    await Promise.all(jobs.map((job) => this._doJob(job)))
  }

  async run() {
    this.continuouslyRunning = true
    while (this.continuouslyRunning) {
      await this.runOnce().catch((err) => {
        console.log(`Failed runOnce: ${err.message}`)
      })

      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  async stop() {
    this.continuouslyRunning = false
  }
}
