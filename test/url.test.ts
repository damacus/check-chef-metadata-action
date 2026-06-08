import * as dns from 'dns'
import * as core from '@actions/core'
import {request} from 'undici'
import {isUrlAccessible} from '../src/metadata'

jest.mock('undici')
jest.mock('@actions/core', () => ({
  debug: jest.fn(),
  warning: jest.fn()
}))

const response = (statusCode: number) => ({
  statusCode,
  body: {
    dump: jest.fn().mockResolvedValue(undefined)
  }
})

describe('URL accessibility check', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue({address: '140.82.121.4', family: 4})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns true for a reachable URL', async () => {
    const successfulResponse = response(200)
    ;(request as jest.Mock).mockResolvedValue(successfulResponse)

    const result = await isUrlAccessible('https://github.com/sous-chefs/java')
    expect(result).toBe(true)
    expect(successfulResponse.body.dump).toHaveBeenCalledWith({
      limit: 1024 * 1024
    })
    expect(request).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/[0-9.]+\/sous-chefs\/java$/),
      expect.objectContaining({
        method: 'GET',
        headers: {Host: 'github.com'}
      })
    )
    expect(request).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headersTimeout: 15000,
        bodyTimeout: 15000
      })
    )
  })

  it('returns false for an unreachable URL (404)', async () => {
    ;(request as jest.Mock).mockResolvedValue(response(404))

    const result = await isUrlAccessible('https://github.com/non-existent')
    expect(result).toBe(false)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('retries transient HTTP statuses before returning success', async () => {
    ;(request as jest.Mock)
      .mockResolvedValueOnce(response(503))
      .mockResolvedValueOnce(response(200))

    const result = await isUrlAccessible(
      'https://github.com/sous-chefs/transient-status'
    )

    expect(result).toBe(true)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('returns false after repeated transient HTTP statuses', async () => {
    ;(request as jest.Mock).mockResolvedValue(response(503))

    const result = await isUrlAccessible(
      'https://github.com/sous-chefs/persistent-status'
    )

    expect(result).toBe(false)
    expect(request).toHaveBeenCalledTimes(3)
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('503'))
  })

  it('returns false for a network error', async () => {
    ;(request as jest.Mock).mockRejectedValue(new Error('Network failure'))

    const result = await isUrlAccessible('https://github.com/error')
    expect(result).toBe(false)
    expect(request).toHaveBeenCalledTimes(3)
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('Network failure')
    )
  })

  it('returns false when request times out', async () => {
    ;(request as jest.Mock).mockRejectedValue(new Error('headers timeout'))

    const result = await isUrlAccessible('https://github.com/timeout')
    expect(result).toBe(false)
    expect(request).toHaveBeenCalledTimes(3)
  })

  it('returns false for file:// protocol (SSRF protection)', async () => {
    const result = await isUrlAccessible('file:///etc/passwd')
    expect(result).toBe(false)
  })

  it('returns false for internal cloud metadata IPs (SSRF protection)', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue({address: '169.254.169.254', family: 4})

    const result = await isUrlAccessible(
      'http://169.254.169.254/latest/meta-data/'
    )
    expect(result).toBe(false)
  })

  it('returns false for localhost (SSRF protection)', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue({address: '127.0.0.1', family: 4})

    const result = await isUrlAccessible('http://127.0.0.1:8080/admin')
    expect(result).toBe(false)
  })

  it('returns false for alternate loopback IP encoding (SSRF protection)', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue({address: '127.0.0.1', family: 4})

    const result = await isUrlAccessible('http://0x7f000001:8080/admin')
    expect(result).toBe(false)
  })

  it('returns false for loopback-resolving domains like localtest.me (SSRF protection)', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue({address: '127.0.0.1', family: 4})

    const result = await isUrlAccessible('http://localtest.me/admin')
    expect(result).toBe(false)
  })

  it('reuses a successful accessibility check for repeated calls', async () => {
    ;(request as jest.Mock).mockResolvedValue(response(200))

    const url = 'https://github.com/sous-chefs/shared-success'

    await expect(isUrlAccessible(url)).resolves.toBe(true)
    await expect(isUrlAccessible(url)).resolves.toBe(true)

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('does not cache a failed accessibility check', async () => {
    ;(request as jest.Mock)
      .mockRejectedValueOnce(new Error('Transient network failure'))
      .mockRejectedValueOnce(new Error('Transient network failure'))
      .mockRejectedValueOnce(new Error('Transient network failure'))
      .mockResolvedValueOnce(response(200))

    const url = 'https://github.com/sous-chefs/retry-after-failure'

    await expect(isUrlAccessible(url)).resolves.toBe(false)
    await expect(isUrlAccessible(url)).resolves.toBe(true)

    expect(request).toHaveBeenCalledTimes(4)
  })

  it('retries transient failures before returning success', async () => {
    ;(request as jest.Mock)
      .mockRejectedValueOnce(new Error('Transient network failure'))
      .mockResolvedValueOnce(response(200))

    const result = await isUrlAccessible(
      'https://github.com/sous-chefs/transient-success'
    )

    expect(result).toBe(true)
    expect(request).toHaveBeenCalledTimes(2)
  })
})
