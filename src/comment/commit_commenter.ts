import type { Octokit } from './commenter';

interface Options {
  owner: string
  repo: string
  commitSHA: string
}

export default class CommitCommenter {
  octokit: Octokit;
  owner: string;
  repo: string;
  commitSHA: string;

  constructor(octokit: Octokit, { owner, repo, commitSHA }: Options) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
    this.commitSHA = commitSHA;
  }

  createComment(content: string) {
    return this.octokit.rest.repos.createCommitComment({
      owner: this.owner,
      repo: this.repo,
      commit_sha: this.commitSHA,
      body: content,
    });
  }

  updateComment(commentID: number, content: string) {
    return this.octokit.rest.repos.updateCommitComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: commentID,
      body: content,
    });
  }

  deleteComment(commentID: number) {
    return this.octokit.rest.repos.deleteCommitComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: commentID,
    });
  }

  listComments(page: number, perPage: number) {
    return this.octokit.rest.repos.listCommentsForCommit({
      owner: this.owner,
      repo: this.repo,
      commit_sha: this.commitSHA,
      page,
      per_page: perPage,
    });
  }

  getComment(commentID: number) {
    return this.octokit.rest.repos.getCommitComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: commentID,
    });
  }
}
