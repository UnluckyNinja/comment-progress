import type { Commenter } from './comment/commenter';
import { getHelpers } from './modeHelpers';

export type Mode = 'update' | 'append' | 'recreate' | 'delete' | 'report'

export default function createOperations(options: {
  mode: Mode,
  commenter: Commenter,
  identifier: string,
  message: string,
  skipCreating: boolean,
  skipDeleting: boolean,
  author: string,
  commentID: number,
}) {
  const skipCreating = options.skipCreating || false
  const skipDeleting = options.skipDeleting || false
  const commentID = options.commentID

  const {
    getOldCommentsAsync,
    getOldCommentByIDAsync,
    deleteOldCommentAsync,
    updateOldCommentAsync,
    createNewCommentAsync,
    generateCommentContent,
  } = getHelpers(options)

  // update mode creates a comment when there is no existing comment that match identifier
  // and updates the matching comment if found
  async function doUpdate() {
    let matchingComment
    if (!commentID) {
      matchingComment = (await getOldCommentsAsync(true)).at(-1);
    } else {
      matchingComment = await getOldCommentByIDAsync(commentID)
    }

    const content = generateCommentContent();

    if (matchingComment) {
      return await updateOldCommentAsync(matchingComment.id, content)
    }

    if (!skipCreating) {
      return await createNewCommentAsync(content);
    }
  }

  // recreate mode deletes the first comment that matches the identifier
  // and creates a new comment
  async function doRecreate() {

    let matchingComment
    if (!commentID) {
      matchingComment = (await getOldCommentsAsync(true)).at(-1);
    } else {
      matchingComment = await getOldCommentByIDAsync(commentID)
    }

    if (matchingComment && !skipDeleting) {
      await deleteOldCommentAsync(matchingComment.id)
    }

    const content = generateCommentContent();

    if (!skipCreating) {
      return await createNewCommentAsync(content);
    }
  }

  // append mode creates a comment when there is no existing comment that match identifier
  // and appends message to a matching comment if found.
  async function doAppend() {

    let matchingComment
    if (!commentID) {
      matchingComment = (await getOldCommentsAsync(true)).at(-1);
    } else {
      matchingComment = await getOldCommentByIDAsync(commentID)
    }

    if (matchingComment) {
      const content = generateCommentContent(matchingComment.body);
      return await updateOldCommentAsync(matchingComment.id, content)
    }

    const content = generateCommentContent();

    if (!skipCreating) {
      return await createNewCommentAsync(content);
    }
  }

  // delete mode deletes an existing comment that matches the identifier
  async function doDelete() {
    let matchingComment
    if (!commentID) {
      matchingComment = (await getOldCommentsAsync(true)).at(-1);
    } else {
      matchingComment = await getOldCommentByIDAsync(commentID)
    }

    if (matchingComment && !skipDeleting) {
      return await deleteOldCommentAsync(matchingComment.id)
    }
  }

  async function doReport() {
    let matchingComment
    if (!commentID) {
      matchingComment = (await getOldCommentsAsync(true)).at(-1);
    } else {
      matchingComment = await getOldCommentByIDAsync(commentID)
    }
    return matchingComment
  }

  return {
    'update': doUpdate,
    'append': doAppend,
    'recreate': doRecreate,
    'delete': doDelete,
    'report': doReport,
  } satisfies Record<Mode, ()=>void>
}
