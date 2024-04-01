/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const github = require('@actions/github')
const main = require('../src/main')

// Mock the GitHub Actions core library
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

const commitsData = {
  status: 200,
  url: 'https://api.github.com/repos/octocat/Hello-World/compare/master...topic',
  headers: {},
  data: require('./sampleResponse.json')
}
const prGetData = {
  data: {
    number: 123,
    titke: 'Unit Test PR',
    base: {
      sha: 'base-sha'
    },
    head: {
      sha: 'head-sha'
    }
  }
}

const contextData = {
  payload: {
    pull_request: {
      number: 123
    }
  }
}

const compareCommitsWithBaseheadMock = jest.fn().mockResolvedValue(commitsData)
const pullGetMock = jest.fn().mockResolvedValue(prGetData)

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
const getOctokitMock = jest
  .spyOn(github, 'getOctokit')
  .mockImplementation(() => {
    return {
      rest: {
        repos: {
          compareCommitsWithBasehead: compareCommitsWithBaseheadMock
        },
        pulls: {
          get: pullGetMock
        }
      }
    }
  })

const mockInput = ({
  file_filter = '*.py',
  pull_number = 123,
  repo_token = '1234567890abcdef',
  repo_owner = 'repoBoss',
  repo_name = 'myRepo'
}) => {
  getInputMock.mockImplementation(name => {
    switch (name) {
      case 'file-filter':
        return file_filter
      case 'pull-number':
        return pull_number
      case 'repo-token':
        return repo_token
      case 'repo-owner':
        return repo_owner
      case 'repo-name':
        return repo_name
      default:
        throw new Error(`Unknown input: ${name}`)
    }
  })
}

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets the output to empty string when no python files', async () => {
    compareCommitsWithBaseheadMock.mockResolvedValue(commitsData)
    mockInput({ file_filter: '*.py' })
    pullGetMock.mockResolvedValue(prGetData)
    github.context.payload = contextData

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'head_sha',
      prGetData.data.head.sha
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'base_sha',
      prGetData.data.base.sha
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'changed_files', '')
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'result', 'Success')
    expect(getOctokitMock).toHaveBeenCalled()
    expect(pullGetMock).toHaveBeenNthCalledWith(1, {
      owner: 'repoBoss',
      repo: 'myRepo',
      pull_number: 123
    })
  })

  it('sets the output to string with added/modified python files', async () => {
    compareCommitsWithBaseheadMock.mockResolvedValue({
      status: 200,
      url: 'https://api.github.com/repos/octocat/Hello-World/compare/master...topic',
      headers: {},
      data: {
        files: [
          { filename: 'file1.py', status: 'added' },
          { filename: 'file2.py', status: 'modified' },
          { filename: 'file3.txt', status: 'added' },
          { filename: 'file4.py', status: 'deleted' }
        ]
      }
    })
    mockInput({ file_filter: '*.py' })
    pullGetMock.mockResolvedValue(prGetData)
    github.context.payload = contextData

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(getOctokitMock).toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'head_sha',
      prGetData.data.head.sha
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'base_sha',
      prGetData.data.base.sha
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      3,
      'changed_files',
      "'file1.py' 'file2.py'"
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'result', 'Success')
  })

  it('sets the output to empty string when no files matched glob', async () => {
    compareCommitsWithBaseheadMock.mockResolvedValue({
      status: 200,
      url: 'https://api.github.com/repos/octocat/Hello-World/compare/master...topic',
      headers: {},
      data: {
        files: [
          { filename: 'file1.md', status: 'added' },
          { filename: 'pyInTheSky', status: 'modified' },
          { filename: 'file3.pip', status: 'added' },
          { filename: 'file4.python', status: 'modifed' }
        ]
      }
    })
    mockInput({ file_filter: '*.py' })
    pullGetMock.mockResolvedValue(prGetData)
    github.context.payload = contextData

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(getOctokitMock).toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'changed_files', '')
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'result', 'Success')
  })

  it('sets the output to all the files when glob provided', async () => {
    compareCommitsWithBaseheadMock.mockResolvedValue({
      status: 200,
      url: 'https://api.github.com/repos/octocat/Hello-World/compare/master...topic',
      headers: {},
      data: {
        files: [
          { filename: 'file1.md', status: 'added' },
          { filename: 'pyInTheSky', status: 'modified' },
          { filename: 'file3.pip', status: 'added' },
          { filename: 'file4.python', status: 'modifed' }
        ]
      }
    })
    mockInput({ file_filter: '' })
    pullGetMock.mockResolvedValue(prGetData)
    github.context.payload = contextData

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(getOctokitMock).toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      3,
      'changed_files',
      "'file1.md' 'pyInTheSky' 'file3.pip' 'file4.python'"
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'result', 'Success')
  })

  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repo-token':
          throw new Error('Input required and not supplied: repo-token')
        default:
          return 'something'
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: repo-token'
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'result', 'Failed')
  })

  it('does nothing when pull request number not provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'pull-number':
          return ''
        case 'file-filter':
          return ''
        case 'repo-token':
          return '1234567890abcdef'
        case 'repo-owner':
          return 'repoBoss'
        case 'repo-name':
          return 'myRepo'
        default:
          throw new Error(`Unknown input: ${name}`)
      }
    })
    github.context.payload = {}

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(getOctokitMock).not.toHaveBeenCalled()
    expect(compareCommitsWithBaseheadMock).not.toHaveBeenCalled()
    expect(pullGetMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'changed_files', '')
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'result',
      'No pull request number provided.'
    )
  })
})
