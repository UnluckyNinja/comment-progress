import type { GitHub } from '@actions/github/lib/utils.js';
import getCommentPrefix from '../identifier.js';
import CommitCommenter from './commit_commenter.js';
import IssueCommenter from './issue_commenter.js';

export type Octokit = InstanceType<typeof GitHub>
export type Commenter = IssueCommenter | CommitCommenter

interface Options {
  owner: string,
  repo: string,
  number: number,
  commitSHA: string,
}

export function getCommenter(octokit: Octokit, {
  owner, repo, number, commitSHA
}: Options) {
  if (number && commitSHA) {
    throw new Error(`'number': ${number}, 'commit-sha': ${commitSHA}, there should be only of of the two.`);
  }
  if (number) {
    return new IssueCommenter(octokit, { owner, repo, number });
  }
  if (commitSHA) {
    return new CommitCommenter(octokit, { owner, repo, commitSHA });
  }
  throw new Error(`Unexpected behavior, both '${number}' and '${commitSHA}' are falsy.`)
}

export async function findMatchingComments(commenter: Commenter, identifier: string, onlyFirst: boolean, author?: string) {
  let fetchMoreComments = true;
  let page = 0;
  const matchingComments = [];
  const commentPrefix = getCommentPrefix(identifier);

  while (fetchMoreComments) {
    page += 1;
    const comments = await commenter.listComments(page, 100);
    fetchMoreComments = comments.data.length !== 0;
    for (const comment of comments.data) {
      const authorFlag = author ? author === comment.user?.login : true
      if (authorFlag && comment.body?.startsWith(commentPrefix)) {
        if (onlyFirst) {
          return [comment]
        }
        matchingComments.push(comment);
      }
    }
  }
  return matchingComments;
}
