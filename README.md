# Comment Progress

[![test](https://github.com/hasura/comment-progress/actions/workflows/test.yml/badge.svg)](https://github.com/hasura/comment-progress/actions/workflows/test.yml)

GitHub Action to notify progress by commenting on GitHub issues, pull requests, and commits.

Commenting inspired by GitHub bots like [netlify](https://github.com/apps/netlify), [sonarcloud](https://github.com/apps/sonarcloud) etc.

Used at [Hasura](https://hasura.io/) to relay progress of long running GitHub Action workflows on pull requests.

## Use case

When deploying preview for a pull request, the GitHub workflow starts by commenting

![review-app-start](images/review-app-start.png)

As the job progresses and if there is a failure at some step, the bot appends the updates about failure in the same comment and fails the GitHub workflow.

![review-app-fail](images/review-app-fail.png)

If the workflow succeeds, the bot comments the details of the preview environment. (configurable to be a new comment or an update to the previous comment that reported the progress)

![review-app-end](images/review-app-end.png)

## Usage

```yml
- uses: hasura/comment-progress@v2.3.0
  with:
    # The GitHub token to be used when creating/updating comments
    # You can use ${{ secrets.GITHUB_TOKEN }}, which is provided in every workflow
    # Required
    github-token: ${{ secrets.GITHUB_TOKEN }}

    # Friendly identifier denoting the context of the comment
    # This id is hidden on the comment made and used for referring the same comment afterwards.
    # Required
    identifier: deploy-progress

    # Markdown message to be used for commenting
    # Required
    message: 'Thank you for opening this PR :pray:'

    # The repository to which the pull request or issue belongs to
    # Default to ${{ github.repository }}
    repository: my-org/my-repo

    # The pull request or issue number on which the comment should be made
    # Default to ${{ github.event.number }} on PR or issue related event
    issue-number: ${{ github.event.number }}

    # The commit sha on which the comment should be made
    # Default to ${{ github.sha }} on commit related event
    commit-sha: ${{ github.sha }}

    # Directly update specified comment instead of searching for identifier.
    comment-id: ${{ steps.prev_progress.outputs.comment_id }}

    # You can specify additional check on author. For example,
    # if you are using GITHUB_TOKEN, it should be `github-actions[bot]`.
    # Doesn't check by default.
    author: github-actions[bot]


    # Comments on the PR/issue and fails the job
    # Default: false
    fail: false

    # Specified mode, default to replace, possible values are:
    # - `update`(default), will replace the content of the old comment, (or create a new one).
    # - `append`, will append content to the end of the comment, (or create a new one).
    # - `recreate`, will delete old comment (if any), and post a new comment.
    # - `delete`, will just delete the old comment, if any.
    # - `report`, will only output related comment id, do nothing. `message` will be ignored.
    # You can specify additional behavior with `skip-creating` and `skip-deleting`.
    # default: update
    mode: update

    # Will create a new comment only if existing comment is found in `update`, `append`, `recreate` mode.
    # If you want to completely skip it. Use step-level `if` instead.
    # Default: false
    skip-creating: false

    # Will not delete the old comment in `recreate`, `delete` mode.
    # Useful if you want to do something else with the old comment. (Custom id will be stripped out.)
    # Default: false
    skip-deleting: false
```

**Note:** The `number` and `commit-sha` fields are mutually exclusive. Only one of them should be set in a job. If both or none are present, an error will be thrown and the job will fail.

## Scenarios

- [Make a simple comment on an issue or pull request](#make-a-simple-comment-on-an-issue-or-pull-request)
- [Make a simple comment on a commit](#make-a-simple-comment-on-a-commit)
- [Make a comment and append updates to the same comment](#make-a-comment-and-append-updates-to-the-same-comment)
- [Delete older/stale comment and add a new comment](#delete-olderstale-comment-and-add-a-new-comment)
- [Delete a comment which is no longer relevant](#delete-a-comment-which-is-no-longer-relevant)

### Make a simple comment on an issue or pull request

Making a simple thank you comment via the github-actions user whenever a pull request is opened.

```yml
on:
  pull_request:
    types: [opened]

jobs:
  thank-user:
    runs-on: ubuntu-latest
    name: Say thanks for the PR
    steps:
      - name: comment on the pull request
        uses: UnluckyNinja/comment-progress@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          identifier: thank-you-comment
          message: 'Thank you for opening this PR :pray:'
```

![say-thanks](images/normal-mode.png)

### Make a simple comment on a commit

This is very similar to commenting on an issue/PR. Here, instead of providing the `number` field we provide the `commit-sha` which is the SHA of the commit that we want to comment on.

```yml
on:
  push:
    branches:
      - main

jobs:
  commit-comment:
    runs-on: ubuntu-latest
    name: Comment on commit with some info
    steps:
      - name: Comment on commit
        uses: UnluckyNinja/comment-progress@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          # You can omit it if it's trigger by commit events
          # commit-sha: ${{ github.sha }}
          identifier: commit-comment
          message: 'This is a commit comment :D.'
```

### Make a comment and append updates to the same comment

This makes use of the `append` flag to add the message to the end of an already existing comment that was made with the same id.

```yml
on:
  pull_request:
    types: [opened]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    name: Deploy preview
    steps:
      - name: Notify about starting this deployment
        uses: UnluckyNinja/comment-progress@v3
        id: progress
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          identifier: deploy-preview
          message: Starting deployment of this pull request.

      - name: Deploy preview
        run: |
          echo "deploy preview"
          # long running step

      - name: Notify about the result of this deployment
        uses: UnluckyNinja/comment-progress@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          comment-id: ${{ steps.progress.outputs.comment_id }}
          identifier: deploy-preview
          message: Deployment of a preview for this pull request was successful.
          mode: append
```

### Delete older/stale comment and add a new comment

Take a case where you need to re-deploy a preview for your pull request and report the status of the redeployment as a new comment and at the same time delete the old comment containing stale information. `recreate` flag will help in achieving this scenario.

```yml
on:
  workflow_dispatch:
    inputs:
      number:
        description: pull request number
        required: true

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    name: Deploy preview
    steps:
      - name: Notify about starting this deployment
        uses: UnluckyNinja/comment-progress@v3
        id: progress
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          number: ${{ github.event.inputs.number }}
          identifier: deploy-preview
          message: Starting deployment of this pull request.
          mode: recreate

      - name: Deploy preview
        run: |
          echo "deploy preview"
          # long running step

      - name: Notify about the result of this deployment
        uses: UnluckyNinja/comment-progress@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          comment-id: ${{ steps.progress.outputs.comment_id }}
          identifier: deploy-preview
          message: Deployment of a preview for this pull request was successful.
          mode: update
```

## Delete a comment which is no longer relevant

Take a case where you need to delete a comment which is no longer relevant. E.g., let's say we previously added a comment in a PR with `id: preview-url` to post a link where the changes of the pull request could be previewed. It might be useful to delete such a comment when the PR is closed to avoid users from accessing stale preview links. We can use the `delete` flag to achieve this.

```yml
on:
  pull_request:
    types: [closed]

jobs:
  cleanup-automated-comments:
    runs-on: ubuntu-20.04
    name: Delete automated PR comments
    steps:
      - name: delete comment that contains a preview link
        uses: UnluckyNinja/comment-progress@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          identifier: preview-url
          message: ''
```

## Contributing

Contributions are welcome :pray: Please [open an issue](https://github.com/hasura/comment-progress/issues/new) before working on something big or breaking.

After making changes to the source code, you will need to perform a packaging step manually by doing the following.

```bash
npm install
npm run build

git add .
git commit -m "generates dist for updated code"
```
