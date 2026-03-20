import type { CommentObjectResponse } from '../../types.js';
import { getNotionClient, rateLimitedDelay, createNotionError } from '../../client.js';
import { isValidNotionId } from '../../utils/validators.js';

// ============================================
// Comment Operations
// ============================================

export interface AddCommentParams {
  pageId?: string;
  discussionId?: string;
  content: string;
}

export interface ListCommentsParams {
  blockId: string;
  pageSize?: number;
  startCursor?: string;
}

export interface ListCommentsResult {
  comments: CommentObjectResponse[];
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Adds a comment to a page or discussion thread
 */
export async function addComment(params: AddCommentParams): Promise<CommentObjectResponse> {
  const client = getNotionClient();
  const { pageId, discussionId, content } = params;

  if (!pageId && !discussionId) {
    throw new Error('Either pageId or discussionId must be provided');
  }

  if (pageId && !isValidNotionId(pageId)) {
    throw new Error(`Invalid page ID format: ${pageId}`);
  }

  try {
    await rateLimitedDelay();

    const richText = [
      {
        type: 'text' as const,
        text: { content },
      },
    ];

    let response;

    if (discussionId) {
      response = await client.comments.create({
        discussion_id: discussionId,
        rich_text: richText,
      });
    } else if (pageId) {
      response = await client.comments.create({
        parent: { page_id: pageId },
        rich_text: richText,
      });
    } else {
      throw new Error('Either pageId or discussionId must be provided');
    }

    return response as CommentObjectResponse;
  } catch (error) {
    throw createNotionError('addComment', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Lists comments on a block or page
 */
export async function listComments(params: ListCommentsParams): Promise<ListCommentsResult> {
  const client = getNotionClient();
  const { blockId, pageSize = 100, startCursor } = params;

  if (!isValidNotionId(blockId)) {
    throw new Error(`Invalid block ID format: ${blockId}`);
  }

  try {
    await rateLimitedDelay();

    const listParams: Parameters<typeof client.comments.list>[0] = {
      block_id: blockId,
      page_size: pageSize,
    };

    if (startCursor) {
      listParams.start_cursor = startCursor;
    }

    const response = await client.comments.list(listParams);

    return {
      comments: response.results as CommentObjectResponse[],
      hasMore: response.has_more,
      nextCursor: response.next_cursor,
    };
  } catch (error) {
    throw createNotionError('listComments', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Lists all comments on a block (handles pagination)
 */
export async function listAllComments(blockId: string): Promise<CommentObjectResponse[]> {
  const allComments: CommentObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const result = await listComments({
      blockId,
      startCursor: cursor,
    });

    allComments.push(...result.comments);
    cursor = result.nextCursor ?? undefined;
  } while (cursor);

  return allComments;
}

/**
 * Extracts plain text from a comment
 */
export function getCommentText(comment: CommentObjectResponse): string {
  if (!comment.rich_text) return '';

  return comment.rich_text
    .map(rt => ('plain_text' in rt ? rt.plain_text : ''))
    .join('');
}

/**
 * Gets comment metadata
 */
export function getCommentMetadata(comment: CommentObjectResponse): {
  id: string;
  createdTime: string;
  createdBy: string;
  discussionId: string;
} {
  return {
    id: comment.id,
    createdTime: comment.created_time,
    createdBy: comment.created_by?.id ?? 'unknown',
    discussionId: comment.discussion_id,
  };
}
