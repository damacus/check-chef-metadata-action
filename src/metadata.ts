import fs from 'fs'

/**
 * Load Cookbook metdata file
 * Returns the metadata without depends or supports lines
 * @returns {Map}
 */
export const metadata = (file_path: fs.PathLike): Map<string, string> => {
  let fileContent: string
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

  try {
    fileContent = fs.readFileSync(file_path, 'utf8')
  } catch (error) {
    throw new Error(
      `Could not read metadata file: ${error}. Did you forget to checkout the file?`
    )
  }

  const arr = fileContent
    .toString()
    .split('\n')
    .filter((el: string): boolean => {
      return (
        !/^%\b/.test(el.trim()) &&
        el.trim() !== '' &&
        !el.trim().startsWith('#')
      )
    })

  for (const element of arr) {
    // Define a regular expression to match key-value pairs in the `element` string
    const regex = /(\w+)\s+('|")(.*?)('|")/
    // Use the regular expression to extract the key and value from the `element` string
    const item = element.match(regex)
    // Get the key and value from the `item` array using array indexing and nullish coalescing operators
    const key: string = item ? item[1] : ''
    const value: string = item ? item[3] : ''

    // Check if the `key` is included in the `allowed_keys` array
    if (allowed_keys.includes(key)) {
      // If the `key` is allowed, add it to the `metadata_structure` Map object
      metadata_structure.set(key, value)
    }
  }

  return metadata_structure
}
