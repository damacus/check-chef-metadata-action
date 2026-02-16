import {
  metadata,
  isValidSemVer,
  isValidVersionConstraint,
  isValidSupport,
  isValidDepends
} from '../src/metadata'

describe('Java cookbook metadata', () => {
  const {data, lines} = metadata('./test/fixtures/metadata.rb')

  it('Has a name property', () => {
    expect(data.has('name')).toEqual(true)
    expect(data.get('name')).toEqual('java')
  })

  it('Has a depends property', () => {
    expect(data.has('depends')).toEqual(true)
    const d = data.get('depends') as string[]
    expect(d).toContain("'line'")
  })

  it('Has supports entries', () => {
    expect(data.has('supports')).toEqual(true)
    const s = data.get('supports') as string[]
    expect(Array.isArray(s)).toBe(true)
    expect(s).toContain("'debian'")
  })

  it('Has correct line numbers', () => {
    expect(lines.get('name')).toEqual(1)
    expect(lines.get('version')).toEqual(9)
    const sLines = lines.get('supports') as number[]
    expect(sLines).toContain(11)
  })
})

describe('Empty metadata file', () => {
  const {data} = metadata('./test/fixtures/metadata.empty.rb')
  it('Has a depends property (empty)', () => {
    expect(data.has('depends')).toEqual(true)
    expect(data.get('depends')).toEqual([])
  })
})

describe('Incorrect metadata', () => {
  const {data} = metadata('./test/fixtures/metadata.incorrect.rb')
  it('Has an incorrect maintainer', () => {
    expect(data.has('maintainer')).toEqual(true)
    expect(data.get('maintainer')).toEqual('Bob')
  })
})

describe('metadata with comments', () => {
  const {data} = metadata('./test/fixtures/aws.metadata.rb')
  it('Has a name property', () => {
    expect(data.has('name')).toEqual(true)
    expect(data.get('name')).toEqual('aws')
  })
})

describe('No metadata file', () => {
  it('Throws error when file not found', () => {
    expect(() => {
      metadata('./test/fixtures/metadata.none.rb')
    }).toThrowError(
      "Could not read metadata file: Error: ENOENT: no such file or directory, open './test/fixtures/metadata.none.rb'."
    )
  })
})

describe('metadata with symbols', () => {
  const {data} = metadata('./test/fixtures/metadata_symbols.rb')

  it('Has a name property from symbol', () => {
    expect(data.get('name')).toEqual('java')
  })

  it('Has a license property from symbol', () => {
    expect(data.get('license')).toEqual('apache2')
  })

  it('Has supports entries from symbols', () => {
    const s = data.get('supports') as string[]
    expect(s).toContain(':ubuntu')
    expect(s).toContain(":centos, '>= 7.0'")
  })
})

describe('isValidSemVer', () => {
  it('identifies valid SemVer strings', () => {
    expect(isValidSemVer('1.2.3')).toBe(true)
    expect(isValidSemVer('0.1.0')).toBe(true)
    expect(isValidSemVer('10.20.30')).toBe(true)
    expect(isValidSemVer('1.2.3-alpha.1')).toBe(true)
    expect(isValidSemVer('1.2.3+build.1')).toBe(true)
  })

  it('identifies invalid SemVer strings', () => {
    expect(isValidSemVer('1.2')).toBe(false)
    expect(isValidSemVer('v1.2.3')).toBe(false)
    expect(isValidSemVer('1.2.3.4')).toBe(false)
    expect(isValidSemVer('abc')).toBe(false)
    expect(isValidSemVer('')).toBe(false)
  })
})

describe('isValidVersionConstraint', () => {
  it('identifies valid version constraints', () => {
    expect(isValidVersionConstraint('>= 15.3')).toBe(true)
    expect(isValidVersionConstraint('> 15.3')).toBe(true)
    expect(isValidVersionConstraint('<= 15.3')).toBe(true)
    expect(isValidVersionConstraint('< 15.3')).toBe(true)
    expect(isValidVersionConstraint('~> 15.3')).toBe(true)
    expect(isValidVersionConstraint('= 15.3')).toBe(true)
    expect(isValidVersionConstraint('15.3')).toBe(true)
    expect(isValidVersionConstraint('>= 15.3.1')).toBe(true)
  })

  it('identifies invalid version constraints', () => {
    expect(isValidVersionConstraint('>> 15.3')).toBe(false)
    expect(isValidVersionConstraint('abc')).toBe(false)
    expect(isValidVersionConstraint('')).toBe(false)
  })
})

describe('isValidSupport', () => {
  it('identifies valid supports entries', () => {
    expect(isValidSupport("'ubuntu'")).toBe(true)
    expect(isValidSupport("'ubuntu', '>= 18.04'")).toBe(true)
    expect(isValidSupport('"ubuntu", ">= 18.04"')).toBe(true)
    expect(isValidSupport("'redhat', '>= 7.0'")).toBe(true)
    expect(isValidSupport(':ubuntu')).toBe(true)
    expect(isValidSupport(":centos, '>= 7.0'")).toBe(true)
  })

  it('identifies invalid supports entries', () => {
    expect(isValidSupport('')).toBe(false)
    expect(isValidSupport("'ubuntu', 'invalid'")).toBe(false)
  })
})

describe('isValidDepends', () => {
  it('identifies valid depends entries', () => {
    expect(isValidDepends("'apt'")).toBe(true)
    expect(isValidDepends("'apt', '>= 1.0.0'")).toBe(true)
    expect(isValidDepends('"apt", ">= 1.0.0"')).toBe(true)
  })

  it('identifies invalid depends entries', () => {
    expect(isValidDepends('')).toBe(false)
    expect(isValidDepends("'apt', 'invalid'")).toBe(false)
  })
})
