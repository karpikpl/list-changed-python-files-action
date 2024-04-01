const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const base_sha = core.getInput('base_sha')
    const head_sha = core.getInput('head_sha')
    const token = core.getInput('repo-token')
    const repo_owner = core.getInput('repo-owner')
    const repo_name = core.getInput('repo-name')
    const octokit = github.getOctokit(token)

    // https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#compare-two-commits
    const compare = await octokit.rest.repos.compareCommitsWithBasehead({
      owner: repo_owner,
      repo: repo_name,
      basehead: `${base_sha}...${head_sha}`
    })
    // see: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-comparing-branches-in-pull-requests#about-three-dot-comparison-on-github

    const changedFiles = compare.data.files
      .filter(f => f.status !== 'deleted')
      .filter(f => f.filename.endsWith('.py'))
      .map(f => f.filename)

    core.setOutput('changed_files', changedFiles.map(f => `'${f}'`).join(' '))
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
