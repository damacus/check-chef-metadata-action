import {runInParallel} from '../src/concurrency'

describe('runInParallel', () => {
  it('runs all tasks', async () => {
    const items = [1, 2, 3, 4, 5]
    const results: number[] = []
    await runInParallel(items, 2, async item => {
      results.push(item)
    })
    expect(results.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('respects concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5]
    let active = 0
    let maxActive = 0

    await runInParallel(items, 2, async () => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise(resolve => setTimeout(resolve, 10))
      active--
    })

    expect(maxActive).toBeLessThanOrEqual(2)
  })
})
