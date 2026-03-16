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

    const result = await isUrlAccessible('https://github.com/error')
    expect(result).toBe(false)
  })

  it('returns false when request times out', async () => {
    ;(request as jest.Mock).mockRejectedValue(new Error('headers timeout'))

    const result = await isUrlAccessible('https://github.com/timeout')
    expect(result).toBe(false)
  })

  it('returns false for file:// protocol (SSRF protection)', async () => {
    const result = await isUrlAccessible('file:///etc/passwd')
    expect(result).toBe(false)
  })

  it('returns false for internal cloud metadata IPs (SSRF protection)', async () => {
    const result = await isUrlAccessible(
      'http://169.254.169.254/latest/meta-data/'
    )
    expect(result).toBe(false)
  })

  it('returns false for localhost (SSRF protection)', async () => {
    const result = await isUrlAccessible('http://127.0.0.1:8080/admin')
    expect(result).toBe(false)
  })
})
