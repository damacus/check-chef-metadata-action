export async function runInParallel<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  // ⚡ Bolt: Replaced O(N^2) queue.shift() with O(N) index tracker
  // queue.shift() re-indexes the entire array every time an item is pulled.
  // Using an index counter prevents this O(N) array shifting operation.
  let currentIndex = 0
  const workers = Array(Math.min(limit, items.length))
    .fill(null)
    .map(async () => {
      while (currentIndex < items.length) {
        const item = items[currentIndex++]
        if (item !== undefined) await fn(item)
      }
    })
  await Promise.all(workers)
}
