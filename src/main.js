const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const token = core.getInput('repo-token')
    const repo_owner = core.getInput('repo-owner')
    const repo_name = core.getInput('repo-name')

    const pull_number =
      github.context?.payload?.pull_request?.number ||
      +core.getInput('pull-number', { required: false })

    if (!pull_number) {
      core.info('No pull request number provided.')
      core.setOutput('changed_files', '')
      core.setOutput('result', 'No pull request number provided.')
      return
    }

    const octokit = github.getOctokit(token)

    const pr = await octokit.rest.pulls.get({
      owner: repo_owner,
      repo: repo_name,
      pull_number
    })

    core.setOutput('head_sha', pr.data.head.sha)
    core.setOutput('base_sha', pr.data.base.sha)
    core.info(`Processing PR ${pull_number}: ${pr.data.title}`)

    // https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#compare-two-commits
    const compare = await octokit.rest.repos.compareCommitsWithBasehead({
      owner: repo_owner,
      repo: repo_name,
      basehead: `${pr.data.base.sha}...${pr.data.head.sha}`
    })
    // see: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-comparing-branches-in-pull-requests#about-three-dot-comparison-on-github

    core.info(
      `Compare status: ${compare.status} Found ${compare.data.files.length} changed files`
    )
    const changedFiles = compare.data.files
      .filter(f => f.status !== 'deleted')
      .filter(f => f.filename.endsWith('.py'))
      .map(f => f.filename)

    core.setOutput('changed_files', changedFiles.map(f => `'${f}'`).join(' '))
    core.setOutput('result', 'Success')
  } catch (error) {
    core.setFailed(error.message)
    core.setOutput('result', 'Failed')
  }
}

module.exports = {
  run
}
