import fs from 'fs'
import * as net from 'net'
import {request} from 'undici'

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

  for (let i = 0; i < rawLines.length; i++) {
    const element = rawLines[i]
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
  try {
    const parsedUrl = new URL(url)

    // SSRF Protection: Only allow HTTP and HTTPS protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false
    }

    // SSRF Protection: Block known internal/metadata hostnames
    const forbiddenHostnames = [
      'localhost',
      'metadata.google.internal',
      '[::1]'
    ]

    let hostname = parsedUrl.hostname.toLowerCase()

    if (
      forbiddenHostnames.includes(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false
    }

    // SSRF Protection: Block internal and private IPs
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      hostname = hostname.substring(1, hostname.length - 1)
    }

    if (net.isIP(hostname)) {
      if (net.isIPv4(hostname)) {
        const parts = hostname.split('.')
        const first = parseInt(parts[0], 10)
        const second = parseInt(parts[1], 10)

        // 10.0.0.0/8 (RFC 1918)
        if (first === 10) return false
        // 127.0.0.0/8 (Loopback)
        if (first === 127) return false
        // 169.254.0.0/16 (Link-local)
        if (first === 169 && second === 254) return false
        // 0.0.0.0/8 (Current network)
        if (first === 0) return false
        // 172.16.0.0/12 (RFC 1918)
        if (first === 172 && second >= 16 && second <= 31) return false
        // 192.168.0.0/16 (RFC 1918)
        if (first === 192 && second === 168) return false
        // 100.64.0.0/10 (CGNAT)
        if (first === 100 && second >= 64 && second <= 127) return false
        // 198.18.0.0/15 (Benchmarking)
        if (first === 198 && second >= 18 && second <= 19) return false
      } else if (net.isIPv6(hostname)) {
        if (hostname === '::1' || hostname === '::') return false
        if (hostname.startsWith('fd') || hostname.startsWith('fc')) return false // ULA
        if (
          hostname.startsWith('fe8') ||
          hostname.startsWith('fe9') ||
          hostname.startsWith('fea') ||
          hostname.startsWith('feb')
        )
          return false // Link-local
        if (hostname.startsWith('::ffff:')) {
          // IPv4-mapped IPv6
          const ipv4Part = hostname.substring(7)
          if (net.isIPv4(ipv4Part)) {
            const parts = ipv4Part.split('.')
            const first = parseInt(parts[0], 10)
            const second = parseInt(parts[1], 10)
            if (first === 10) return false
            if (first === 127) return false
            if (first === 169 && second === 254) return false
            if (first === 0) return false
            if (first === 172 && second >= 16 && second <= 31) return false
            if (first === 192 && second === 168) return false
            if (first === 100 && second >= 64 && second <= 127) return false
            if (first === 198 && second >= 18 && second <= 19) return false
          }
        }
      }
    }

    const {statusCode} = await request(url, {
      method: 'GET',
      headersTimeout: timeout,
      bodyTimeout: timeout
    })
    return statusCode === 200
  } catch {
    return false
  }
}
