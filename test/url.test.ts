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

  it('returns false for alternate loopback IPs (SSRF protection)', async () => {
    const result = await isUrlAccessible('http://127.0.0.2:8080/admin')
    expect(result).toBe(false)
  })

  it('returns false for private IPs (SSRF protection)', async () => {
    const result1 = await isUrlAccessible('http://10.0.0.1/admin')
    expect(result1).toBe(false)

    const result2 = await isUrlAccessible('http://192.168.1.1/admin')
    expect(result2).toBe(false)

    const result3 = await isUrlAccessible('http://172.16.0.1/admin')
    expect(result3).toBe(false)
  })

  it('returns false for 0.0.0.0 (SSRF protection)', async () => {
    const result = await isUrlAccessible('http://0.0.0.0/admin')
    expect(result).toBe(false)
  })

  it('returns false for alternate IP encodings (SSRF protection)', async () => {
    // 0x7f000001 is 127.0.0.1
    const result = await isUrlAccessible('http://0x7f000001/admin')
    expect(result).toBe(false)
  })

  it('returns false for IPv6 loopback and private IPs (SSRF protection)', async () => {
    const result1 = await isUrlAccessible('http://[::1]/admin')
    expect(result1).toBe(false)

    const result2 = await isUrlAccessible('http://[fc00::1]/admin')
    expect(result2).toBe(false)

    const result3 = await isUrlAccessible('http://[::ffff:127.0.0.1]/admin')
    expect(result3).toBe(false)
  })
})
