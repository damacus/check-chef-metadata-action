import * as core from '@actions/core'
import * as github from '@actions/github'

const github.getOctokit(core.getInput('github-token', {required: true}))
