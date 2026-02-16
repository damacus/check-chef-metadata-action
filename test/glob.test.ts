import {glob} from 'glob'

jest.mock('glob', () => ({
  glob: jest.fn()
}))

describe('Glob pattern resolution', () => {
  it('resolves a single file path correctly', async () => {
    ;(glob as unknown as jest.Mock).mockResolvedValue(['/path/to/metadata.rb'])

    const pattern = 'metadata.rb'
    const files = await glob(pattern)

    expect(files).toEqual(['/path/to/metadata.rb'])
    expect(glob).toHaveBeenCalledWith(pattern)
  })

  it('resolves multiple files with a glob pattern', async () => {
    ;(glob as unknown as jest.Mock).mockResolvedValue([
      '/path/to/cookbooks/cb1/metadata.rb',
      '/path/to/cookbooks/cb2/metadata.rb'
    ])

    const pattern = 'cookbooks/*/metadata.rb'
    const files = await glob(pattern)

    expect(files.length).toBe(2)
    expect(files).toContain('/path/to/cookbooks/cb1/metadata.rb')
    expect(files).toContain('/path/to/cookbooks/cb2/metadata.rb')
  })
})
