import type { Mode } from './modes';
import { info } from '@actions/core';
import { type Commenter, findMatchingComments } from './comment/commenter';
import getCommentPrefix from './identifier';

export function getHelpers(options: {
  mode: Mode,
  commenter: Commenter,
  identifier: string,
  message: string,
  author: string,
}) {
  const {
    mode,
    commenter,
    identifier,
    message,
    author
  } = options

  // loggers
  async function getOldCommentsAsync(onlyFirst: boolean) {
    info(`[${mode}] Finding comments for ${identifier}.`);
    const result = await findMatchingComments(commenter, identifier, onlyFirst, author);
    info(`[${mode}] Comments found with ${identifier}: ${result.length}`);
    return result
  }
  async function getOldCommentByIDAsync(id: number) {
    info(`[${mode}] Finding comment with id: ${identifier}.`);
    const result = await commenter.getComment(id);
    if (result.status !== 200) {
      throw new Error(`API request failed, status code: ${result.status}`)
    }
    info(`[${mode}] Comment Found.`);
    return result.data
  }
  async function deleteOldCommentAsync(id: number) {
    info(`[${mode}] Deleting github comment ${id}`);
    const result = await commenter.deleteComment(id);
    if (result.status !== 204) {
      throw new Error(`API request failed, status code: ${result.status}`)
    }
    info(`[${mode}] Comment ${id} has been deleted.`);
    return result.data
  }
  async function updateOldCommentAsync(id: number, content: string) {
    info(`[${mode}] Updating an existing comment for ${identifier}.`);
    const result = await commenter.updateComment(id, content);
    if (result.status !== 200) {
      throw new Error(`API request failed, status code: ${result.status}`)
    }
    info(`[${mode}] Updated comment: ${result.data.html_url}`);
    return result.data
  }
  async function createNewCommentAsync(content: string) {
    info(`[${mode}] Creating a new comment for ${identifier}.`);
    const result = await commenter.createComment(content);
    if (result.status !== 201) {
      throw new Error(`API request failed, status code: ${result.status}`)
    }
    info(`[${mode}] Created comment: ${result.data.html_url}`);
    return result.data
  }
  function generateCommentContent(oldContent?: string) {
    return `${oldContent || getCommentPrefix(identifier)}\n${message}`
  }

  return {
    getOldCommentsAsync,
    getOldCommentByIDAsync,
    deleteOldCommentAsync,
    updateOldCommentAsync,
    createNewCommentAsync,
    generateCommentContent,
  }
}