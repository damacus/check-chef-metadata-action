import {metadata} from '../src/metadata'

describe('Java cookbook metadata', () => {
  const data = metadata('./test/fixtures/metadata.rb')

  it('Has a name property', () => {
    expect(data.has('name')).toEqual(true)
    expect(data.get('name')).toEqual('java')
  })

  it('Does not have a depends property', () => {
    expect(data.has('depends')).toEqual(false)
  })
})

describe('Empty metadata file', () => {
  const data = metadata('./test/fixtures/metadata.empty.rb')
  it('Does not have a depends property', () => {
    expect(data.has('depends')).toEqual(false)
  })
})

describe('Incorrect metadata', () => {
  const data = metadata('./test/fixtures/metadata.incorrect.rb')
  it('Has an incorrect maintainer', () => {
    expect(data.has('maintainer')).toEqual(true)
    expect(data.get('maintainer')).toEqual('Bob')
  })
})

describe('metadata with comments', () => {
  const data = metadata('./test/fixtures/aws.metadata.rb')
  it('Has a name property', () => {
    expect(data.has('name')).toEqual(true)
    expect(data.get('name')).toEqual('aws')
  })
})

describe('No metadata file', () => {
  expect(() => {
    metadata('./test/fixtures/metadata.none.rb')
  }).toThrowError(
    "Could not read metadata file: Error: ENOENT: no such file or directory, open './test/fixtures/metadata.none.rb'."
  )
})
