export class Mutex {
  private locked = false
  private queue: (() => void)[] = []

  async lock(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.locked) {
        this.locked = true
        resolve()
      } else {
        this.queue.push(resolve)
      }
    })
  }

  release(): void {
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift()
      if (nextResolve) {
        nextResolve()
      }
    } else {
      this.locked = false
    }
  }
}
