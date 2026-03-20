import type {
  BlockObjectResponse,
  ListBlockChildrenResponse,
  AppendBlockChildrenResponse,
  NotionBlock,
} from '../../types.js';
import { getNotionClient, rateLimitedDelay, createNotionError } from '../../client.js';
import { isFullBlock } from '../../utils/validators.js';
import { blocksToApiFormat } from '../../utils/notion-blocks.js';

// ============================================
// Block Operations
// ============================================

export interface AppendBlocksParams {
  parentId: string;
  blocks: NotionBlock[];
}

export interface ReadBlocksParams {
  blockId: string;
  pageSize?: number;
  startCursor?: string;
}

export interface ReadBlocksResult {
  blocks: BlockObjectResponse[];
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Appends blocks as children to a parent block or page
 */
export async function appendBlocks(params: AppendBlocksParams): Promise<AppendBlockChildrenResponse> {
  const client = getNotionClient();
  const { parentId, blocks } = params;

  try {
    await rateLimitedDelay();

    const response = await client.blocks.children.append({
      block_id: parentId,
      children: blocksToApiFormat(blocks) as Parameters<typeof client.blocks.children.append>[0]['children'],
    });

    return response;
  } catch (error) {
    throw createNotionError('appendBlocks', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Reads all child blocks of a block or page
 */
export async function readBlocks(params: ReadBlocksParams): Promise<ReadBlocksResult> {
  const client = getNotionClient();
  const { blockId, pageSize = 100, startCursor } = params;

  try {
    await rateLimitedDelay();

    const response: ListBlockChildrenResponse = await client.blocks.children.list({
      block_id: blockId,
      page_size: pageSize,
      start_cursor: startCursor,
    });

    const blocks = response.results.filter(isFullBlock);

    return {
      blocks,
      hasMore: response.has_more,
      nextCursor: response.next_cursor,
    };
  } catch (error) {
    throw createNotionError('readBlocks', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Reads all blocks recursively (handles pagination)
 */
export async function readAllBlocks(blockId: string): Promise<BlockObjectResponse[]> {
  const allBlocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const result = await readBlocks({
      blockId,
      startCursor: cursor,
    });

    allBlocks.push(...result.blocks);
    cursor = result.nextCursor ?? undefined;
  } while (cursor);

  return allBlocks;
}

/**
 * Retrieves a single block by ID
 */
export async function getBlock(blockId: string): Promise<BlockObjectResponse> {
  const client = getNotionClient();

  try {
    await rateLimitedDelay();

    const response = await client.blocks.retrieve({
      block_id: blockId,
    });

    if (!isFullBlock(response)) {
      throw new Error('Received partial block response');
    }

    return response;
  } catch (error) {
    throw createNotionError('getBlock', { blockId }, error);
  }
}

/**
 * Updates a block's content
 */
export async function updateBlock(
  blockId: string,
  content: Record<string, unknown>
): Promise<BlockObjectResponse> {
  const client = getNotionClient();

  try {
    await rateLimitedDelay();

    const response = await client.blocks.update({
      block_id: blockId,
      ...content,
    });

    if (!isFullBlock(response)) {
      throw new Error('Received partial block response');
    }

    return response;
  } catch (error) {
    throw createNotionError('updateBlock', { blockId, content }, error);
  }
}

/**
 * Deletes a block (archives it in Notion)
 */
export async function deleteBlock(blockId: string): Promise<BlockObjectResponse> {
  const client = getNotionClient();

  try {
    await rateLimitedDelay();

    const response = await client.blocks.delete({
      block_id: blockId,
    });

    if (!isFullBlock(response)) {
      throw new Error('Received partial block response');
    }

    return response;
  } catch (error) {
    throw createNotionError('deleteBlock', { blockId }, error);
  }
}

/**
 * Replaces all content in a block/page with new blocks
 * Note: This deletes existing children first, then appends new ones
 */
export async function replaceBlocks(
  parentId: string,
  newBlocks: NotionBlock[]
): Promise<AppendBlockChildrenResponse> {
  // First, get and delete all existing children
  const existingBlocks = await readAllBlocks(parentId);

  for (const block of existingBlocks) {
    await deleteBlock(block.id);
  }

  // Then append new blocks
  return appendBlocks({ parentId, blocks: newBlocks });
}
