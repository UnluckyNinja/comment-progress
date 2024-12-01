import type { Octokit } from './commenter';

interface Options {
  owner: string
  repo: string
  number: number
}

export default class IssueCommenter {
  octokit: Octokit
  owner: string;
  repo: string;
  number: number;

  constructor(octokit: Octokit, { owner, repo, number }: Options) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
    this.number = number;
  }

  createComment(content: string) {
    return this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: this.number,
      body: content,
    });
  }

  updateComment(commentID: number, content: string) {
    return this.octokit.rest.issues.updateComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: commentID,
      body: content,
    });
  }

  deleteComment(commentID: number) {
    return this.octokit.rest.issues.deleteComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: commentID,
    });
  }

  listComments(page: number, perPage: number) {
    return this.octokit.rest.issues.listComments({
      owner: this.owner,
      repo: this.repo,
      issue_number: this.number,
      page,
      per_page: perPage,
    });
  }

  getComment(commentID: number) {
    return this.octokit.rest.issues.getComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: commentID,
    });
  }
}
