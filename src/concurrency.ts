export async function runInParallel<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items]
  const workers = Array(Math.min(limit, items.length))
    .fill(null)
    .map(async () => {
      while (queue.length > 0) {
        const item = queue.shift()
        if (item !== undefined) await fn(item)
      }
    })
  await Promise.all(workers)
}
