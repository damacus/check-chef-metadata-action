import {request} from 'undici'
import {isUrlAccessible} from '../src/metadata'

jest.mock('undici')

describe('URL accessibility check', () => {
  it('returns true for a reachable URL', async () => {
    ;(request as jest.Mock).mockResolvedValue({
      statusCode: 200
    })

    const result = await isUrlAccessible('https://github.com/sous-chefs/java')
    expect(result).toBe(true)
    expect(request).toHaveBeenCalledWith(
      'https://github.com/sous-chefs/java',
      expect.objectContaining({
        method: 'GET'
      })
    )
  })

  it('returns false for an unreachable URL (404)', async () => {
    ;(request as jest.Mock).mockResolvedValue({
      statusCode: 404
    })

    const result = await isUrlAccessible('https://github.com/non-existent')
    expect(result).toBe(false)
  })

  it('returns false for a network error', async () => {
    ;(request as jest.Mock).mockRejectedValue(new Error('Network failure'))

    const result = await isUrlAccessible('https://github.com/error', 5000, 0)
    expect(result).toBe(false)
  })

  it('returns false when request times out', async () => {
    ;(request as jest.Mock).mockRejectedValue(new Error('headers timeout'))

    const result = await isUrlAccessible('https://github.com/timeout', 5000, 0)
    expect(result).toBe(false)
  })
})

describe('URL retry logic', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('retries on network error and succeeds on second attempt', async () => {
    ;(request as jest.Mock)
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({statusCode: 200})

    const promise = isUrlAccessible('https://github.com/retry-test', 5000, 1)
    await jest.runAllTimersAsync()
    const result = await promise

    expect(result).toBe(true)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('exhausts all retries and returns false', async () => {
    ;(request as jest.Mock).mockRejectedValue(new Error('Network failure'))

    const promise = isUrlAccessible('https://github.com/always-fail', 5000, 2)
    await jest.runAllTimersAsync()
    const result = await promise

    expect(result).toBe(false)
    expect(request).toHaveBeenCalledTimes(3)
  })

  it('does not retry on non-200 status', async () => {
    ;(request as jest.Mock).mockResolvedValue({statusCode: 404})

    const result = await isUrlAccessible('https://github.com/not-found', 5000, 2)

    expect(result).toBe(false)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('zero retries means single attempt only', async () => {
    ;(request as jest.Mock).mockRejectedValue(new Error('Network failure'))

    const promise = isUrlAccessible('https://github.com/no-retry', 5000, 0)
    await jest.runAllTimersAsync()
    const result = await promise

    expect(result).toBe(false)
    expect(request).toHaveBeenCalledTimes(1)
  })
})
