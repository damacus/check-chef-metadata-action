import fs from 'fs'
import {request} from 'undici'
import * as dns from 'dns'
import * as net from 'net'

export interface MetadataResult {
  data: Map<string, string | string[]>
  lines: Map<string, number | number[]>
}

/**
 * Load Cookbook metdata file
 * Returns the metadata including supports lines and their line numbers
 * @returns {MetadataResult}
 */
export const metadata = (file_path: fs.PathLike): MetadataResult => {
  let fileContent: string
  const data = new Map<string, string | string[]>()
  const lines = new Map<string, number | number[]>()
  const supports: string[] = []
  const supportsLines: number[] = []
  const depends: string[] = []
  const dependsLines: number[] = []

  const allowed_keys = [
    'name',
    'maintainer',
    'maintainer_email',
    'license',
    'description',
    'source_url',
    'issues_url',
    'chef_version',
    'version'
  ]

  try {
    fileContent = fs.readFileSync(file_path, 'utf8')
  } catch (error) {
    throw new Error(
      `Could not read metadata file: ${error}. Did you forget to checkout the file?`
    )
  }

  const rawLines = fileContent.toString().split('\n')

  const stripInlineComment = (line: string): string => {
    let inSingleQuote = false
    let inDoubleQuote = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const prevChar = i > 0 ? line[i - 1] : ''

      if (char === "'" && !inDoubleQuote && prevChar !== '\\') {
        inSingleQuote = !inSingleQuote
      } else if (char === '"' && !inSingleQuote && prevChar !== '\\') {
        inDoubleQuote = !inDoubleQuote
      } else if (char === '#' && !inSingleQuote && !inDoubleQuote) {
        return line.slice(0, i).trimEnd()
      }
    }

    return line
  }

  for (let i = 0; i < rawLines.length; i++) {
    const element = stripInlineComment(rawLines[i])
    const trimmedElement = element.trim()

    // Skip comments and empty lines
    if (
      /^%\b/.test(trimmedElement) ||
      trimmedElement === '' ||
      trimmedElement.startsWith('#')
    ) {
      continue
    }

    const parts = trimmedElement.split(/\s+/)
    if (parts.length < 2) continue

    const key = parts[0]
    const lineNumber = i + 1

    if (key === 'supports') {
      const value = trimmedElement.substring(key.length).trim()
      supports.push(value)
      supportsLines.push(lineNumber)
    } else if (key === 'depends') {
      const value = trimmedElement.substring(key.length).trim()
      depends.push(value)
      dependsLines.push(lineNumber)
    } else if (allowed_keys.includes(key)) {
      // Support both quoted strings and symbols
      const regex = /(\w+)\s+(?:(?:'|")(.*?)('|")|:(\w+))/
      const item = element.match(regex)
      let value = ''
      if (item) {
        value = item[2] || item[4] || ''
      }

      // If the `key` is allowed, add it to the `data` Map object
      data.set(key, value)
      lines.set(key, lineNumber)
    }
  }

  data.set('supports', supports)
  lines.set('supports', supportsLines)
  data.set('depends', depends)
  lines.set('depends', dependsLines)

  return {data, lines}
}

/**
 * Validates if a string is a valid Semantic Version
 * @param version The version string to validate
 * @returns boolean
 */
export const isValidSemVer = (version: string): boolean => {
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
  return semverRegex.test(version)
}

/**
 * Validates if a string is a valid Chef version constraint
 * @param constraint The constraint string to validate
 * @returns boolean
 */
export const isValidVersionConstraint = (constraint: string): boolean => {
  const constraintRegex =
    /^(?:>=|>|<=|<|~>|=)?\s*\d+(?:\.\d+)*(?:-[a-zA-Z0-9.]+)?$/
  return constraintRegex.test(constraint) && constraint.length > 0
}

/**
 * Validates if a string is a valid Chef supports entry
 * @param support The support string to validate
 * @returns boolean
 */
export const isValidSupport = (support: string): boolean => {
  // Matches 'platform' or 'platform', 'constraint' or :platform or :platform, 'constraint'
  const supportRegex =
    /^(?:(?:'|")([a-z0-9_-]+)(?:'|")|:([a-z0-9_-]+))(?:\s*,\s*(?:'|")([^'"]+)(?:'|"))?$/
  const match = support.match(supportRegex)
  if (!match) return false

  const platform = match[1] || match[2]
  const constraint = match[3]

  if (constraint && !isValidVersionConstraint(constraint)) {
    return false
  }

  return !!platform
}

/**
 * Validates if a string is a valid Chef depends entry
 * @param depends The depends string to validate
 * @returns boolean
 */
export const isValidDepends = (depends: string): boolean => {
  // Matches 'cookbook' or 'cookbook', 'constraint'
  const dependsRegex =
    /^(?:(?:'|")([a-z0-9_-]+)(?:'|"))(?:\s*,\s*(?:'|")([^'"]+)(?:'|"))?$/
  const match = depends.match(dependsRegex)
  if (!match) return false

  const cookbook = match[1]
  const constraint = match[2]

  if (constraint && !isValidVersionConstraint(constraint)) {
    return false
  }

  return !!cookbook
}

// ⚡ Bolt: Cache URL accessibility checks to prevent redundant network requests and DNS lookups
// This drastically speeds up execution when many cookbooks share the same source_url or issues_url
const urlAccessibilityCache = new Map<string, Promise<boolean>>()

/**
 * Checks if a URL is accessible (HTTP 200)
 * @param url The URL to check
 * @param timeout The timeout in milliseconds (default: 5000)
 * @returns Promise<boolean>
 */
export async function isUrlAccessible(
  url: string,
  timeout = 5000
): Promise<boolean> {
  const cacheKey = `${url}|${timeout}`
  const cached = urlAccessibilityCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const checkPromise = (async () => {
    try {
      const parsedUrl = new URL(url)

      // SSRF Protection: Only allow HTTP and HTTPS protocols
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return false
      }

      // SSRF Protection: Block known internal/metadata hostnames
      const hostname = parsedUrl.hostname.toLowerCase()

      // Resolve hostname to IP to prevent DNS rebinding and alternate IP encoding (e.g. 0x7f000001)
      let ipAddress: string

      // Check if hostname is an IP, handle decimal encodings like 0x7f000001
      try {
        const lookupResult = await dns.promises.lookup(hostname)
        ipAddress = lookupResult.address
      } catch {
        return false // DNS resolution failed
      }

      if (ipAddress === '0.0.0.0' || ipAddress === '255.255.255.255') {
        return false
      }

      if (net.isIPv4(ipAddress)) {
        const parts = ipAddress.split('.').map(Number)
        if (
          parts[0] === 127 || // Loopback (127.0.0.0/8)
          parts[0] === 10 || // Private (10.0.0.0/8)
          (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // Private (172.16.0.0/12)
          (parts[0] === 192 && parts[1] === 168) || // Private (192.168.0.0/16)
          (parts[0] === 169 && parts[1] === 254) || // Link-local (169.254.0.0/16)
          (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) // Carrier-grade NAT (100.64.0.0/10)
        ) {
          return false
        }
      } else if (net.isIPv6(ipAddress)) {
        const ip = ipAddress.toLowerCase()
        if (
          ip === '::1' || // Loopback
          ip.startsWith('::ffff:127.') || // IPv4-mapped IPv6 loopback
          ip.startsWith('fc00:') ||
          ip.startsWith('fd00:') || // Unique local address (ULA)
          ip.startsWith('fe80:') // Link-local
        ) {
          return false
        }
      }

      // SSRF Protection: Prevent DNS rebinding by sending request directly to the validated IP
      // and specifying the original hostname in the Host header.
      const safeUrl = new URL(url)
      safeUrl.hostname = ipAddress

      const {statusCode} = await request(safeUrl.toString(), {
        method: 'GET',
        headers: {
          Host: parsedUrl.hostname
        },
        headersTimeout: timeout,
        bodyTimeout: timeout
      })
      return statusCode === 200
    } catch {
      return false
    }
  })()

  const cachedPromise = (async () => {
    const result = await checkPromise

    // Preserve deduplication for concurrent callers, but only retain successful
    // results so a transient network failure does not poison the whole run.
    if (!result) {
      urlAccessibilityCache.delete(cacheKey)
    }

    return result
  })()

  urlAccessibilityCache.set(cacheKey, cachedPromise)
  return cachedPromise
}
