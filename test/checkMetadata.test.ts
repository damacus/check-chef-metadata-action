import {checkMetadata} from '../src/checkMetadata'

describe('Correct metadata', () => {
  it('an empty validation message', async () => {
    process.env.GITHUB_REPOSITORY = 'sous-chefs/java'
    const message = await checkMetadata('./test/fixtures/metadata.rb')
    expect(message).toEqual({
      message: 'Metadata matches',
      conclusion: 'success',
      comment: '',
      name: 'Metadata validation'
    })
  })
})

describe('An incorrect maintainer', () => {
  it('tells the user which property is not set correctly', async () => {
    const message = await checkMetadata('./test/fixtures/metadata.incorrect.rb')
    expect(message).toEqual({
      message: 'Metadata matches',
      conclusion: 'failure',
      comment: `
Maintainer is not set to Sous Chefs`,
      name: 'Metadata validation'
    })
  })
})
