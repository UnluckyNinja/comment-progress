import { debug, getInput, setFailed, setOutput } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { getCommenter } from './comment/commenter.js';
import createOperations from './modes.js';

function parseRepository(repository: string) {
  if (repository === '') {
    return context.repo
  }
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) {
    throw new Error(`Invalid repository: ${repository}`);
  }
  return {
    owner,
    repo
  }
}

function isCorrectMode(mode: string): mode is 'update' | 'append' | 'recreate' | 'delete' | 'report' {
  return ['update', 'append', 'recreate', 'delete', 'report'].includes(mode)
} 

function parseInputs() {
  const githubToken = getInput('github-token', { required: true });
  const { owner, repo } = parseRepository(getInput('repository'))

  const issueNumber = Number.parseInt(getInput('issue-number')) || context.issue?.number
  const commitSHA = getInput('commit-sha')
  debug(`context.issue.number: ${ context.issue?.number }`)
  debug(`context.sha: ${ context.sha }`)
  const commentID = Number.parseInt(getInput('comment-id'))
  if (!commitSHA && !issueNumber && !commentID) {
    throw new Error('Faild to get commit or issue info from context. '
      + 'At least one of commit SHA, issue number, or comment id has to be provided '
      + 'to make this action work.')
  }

  const author = getInput('author');

  const mode = getInput('mode') || 'update'
  if (!isCorrectMode(mode)) {
    throw new Error('Mode is not correctly specified in inputs.')
  }

  const identifier = getInput('identifier', { required: true });
  const message = getInput('message', { required: true });

  const fail = getInput('fail') || false
  const skipCreating = getInput('skip-creating') === 'true' || false
  const skipDeleting = getInput('skip-deleting') === 'true' || false


  return {
    githubToken,
    owner,
    repo,
    issueNumber,
    commitSHA,
    commentID,
    author,
    mode,
    identifier,
    message,
    fail,
    skipCreating,
    skipDeleting,
  }
}

export default async function run() {
  const inputs = parseInputs()
  const octokit = getOctokit(inputs.githubToken);
  const commenter = getCommenter(octokit, {
    owner: inputs.owner,
    repo: inputs.repo,
    number: inputs.issueNumber,
    commitSHA: inputs.commitSHA,
  });

  const operations = createOperations({
    ...inputs,
    commenter
  })
  const mode = inputs.mode

  const result = await operations[mode]()
  setOutput('comment_id', result?.id ?? null)

  if (inputs.fail === 'true') {
    setFailed(inputs.message);
  }
}
