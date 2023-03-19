import fs from 'fs'

/**
 * Load Cookbook metdata file
 * Returns the metadata without depends or supports lines
 * @returns {Map}
 */
export const metadata = (file_path: fs.PathLike): Map<string, string> => {
  const data = fs.readFileSync(file_path, 'utf8')
  const metadata_structure = new Map<string, string>()
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

  const arr = data
    .toString()
    .split('\n')
    .filter((el: string): boolean => {
      return el !== ''
    })

  for (const element of arr) {
    const regex = /(?<key>\w+)\s+('|")(?<value>.+)('|")/
    const item = element.match(regex)

    if (!item?.groups?.key || !item?.groups?.value) {
      throw new Error('No valid metadata found')
    }

    const key: string = item?.groups?.key ?? ''
    const value: string = item?.groups?.value ?? ''

    if (allowed_keys.includes(key)) {
      metadata_structure.set(key, value)
    }
  }

  return metadata_structure
}
