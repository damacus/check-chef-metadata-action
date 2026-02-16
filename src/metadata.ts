import fs from 'fs'

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
