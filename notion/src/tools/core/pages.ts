import type {
  PageObjectResponse,
  CreatePageResponse,
  UpdatePageResponse,
  PropertyValue,
  NotionBlock,
} from '../../types.js';
import { getNotionClient, rateLimitedDelay, createNotionError } from '../../client.js';
import { isFullPage, isValidNotionId } from '../../utils/validators.js';
import { blocksToApiFormat } from '../../utils/notion-blocks.js';

// ============================================
// Page Operations
// ============================================

export interface CreatePageParams {
  parentPageId?: string;
  parentDatabaseId?: string;
  title: string;
  properties?: Record<string, PropertyValue>;
  content?: NotionBlock[];
  icon?: { emoji: string } | { external: { url: string } };
  cover?: { external: { url: string } };
}

export interface UpdatePageParams {
  pageId: string;
  properties?: Record<string, PropertyValue>;
  archived?: boolean;
  icon?: { emoji: string } | { external: { url: string } } | null;
  cover?: { external: { url: string } } | null;
}

/**
 * Creates a new page in Notion
 */
export async function createPage(params: CreatePageParams): Promise<CreatePageResponse> {
  const client = getNotionClient();
  const { parentPageId, parentDatabaseId, title, properties = {}, content, icon, cover } = params;

  if (!parentPageId && !parentDatabaseId) {
    throw new Error('Either parentPageId or parentDatabaseId must be provided');
  }

  if (parentPageId && parentDatabaseId) {
    throw new Error('Cannot specify both parentPageId and parentDatabaseId');
  }

  try {
    await rateLimitedDelay();

    // Build the parent object
    const parent = parentDatabaseId
      ? { database_id: parentDatabaseId }
      : { page_id: parentPageId! };

    // Build properties with title
    const pageProperties: Record<string, unknown> = { ...properties };

    // If creating under a database, title goes in the title property
    // If creating under a page, we need to set the title differently
    if (parentDatabaseId) {
      // Find the title property or default to "Name"
      const titleKey = Object.keys(properties).find(
        key => (properties[key] as PropertyValue | undefined)?.type === 'title'
      ) ?? 'Name';

      pageProperties[titleKey] = {
        title: [{ type: 'text', text: { content: title } }],
      };
    } else {
      pageProperties['title'] = {
        title: [{ type: 'text', text: { content: title } }],
      };
    }

    const createParams: Parameters<typeof client.pages.create>[0] = {
      parent,
      properties: pageProperties as Parameters<typeof client.pages.create>[0]['properties'],
    };

    if (icon) {
      if ('emoji' in icon) {
        createParams.icon = { type: 'emoji', emoji: icon.emoji as Parameters<typeof client.pages.create>[0]['icon'] extends { emoji: infer E } ? E : never };
      } else {
        createParams.icon = { type: 'external', external: icon.external };
      }
    }

    if (cover) {
      createParams.cover = { type: 'external', external: cover.external };
    }

    if (content && content.length > 0) {
      createParams.children = blocksToApiFormat(content) as Parameters<typeof client.pages.create>[0]['children'];
    }

    const response = await client.pages.create(createParams);

    return response;
  } catch (error) {
    throw createNotionError('createPage', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Retrieves a page by ID
 */
export async function readPage(pageId: string): Promise<PageObjectResponse> {
  const client = getNotionClient();

  if (!isValidNotionId(pageId)) {
    throw new Error(`Invalid page ID format: ${pageId}`);
  }

  try {
    await rateLimitedDelay();

    const response = await client.pages.retrieve({
      page_id: pageId,
    });

    if (!isFullPage(response)) {
      throw new Error('Received partial page response');
    }

    return response;
  } catch (error) {
    throw createNotionError('readPage', { pageId }, error);
  }
}

/**
 * Updates a page's properties
 */
export async function updatePage(params: UpdatePageParams): Promise<UpdatePageResponse> {
  const client = getNotionClient();
  const { pageId, properties, archived, icon, cover } = params;

  if (!isValidNotionId(pageId)) {
    throw new Error(`Invalid page ID format: ${pageId}`);
  }

  try {
    await rateLimitedDelay();

    const updateParams: Parameters<typeof client.pages.update>[0] = {
      page_id: pageId,
    };

    if (properties) {
      updateParams.properties = properties as Parameters<typeof client.pages.update>[0]['properties'];
    }

    if (archived !== undefined) {
      updateParams.archived = archived;
    }

    if (icon !== undefined) {
      if (icon === null) {
        updateParams.icon = null;
      } else if ('emoji' in icon) {
        updateParams.icon = { type: 'emoji', emoji: icon.emoji as Parameters<typeof client.pages.update>[0]['icon'] extends { emoji: infer E } | null | undefined ? E : never };
      } else {
        updateParams.icon = { type: 'external', external: icon.external };
      }
    }

    if (cover !== undefined) {
      if (cover === null) {
        updateParams.cover = null;
      } else {
        updateParams.cover = { type: 'external', external: cover.external };
      }
    }

    const response = await client.pages.update(updateParams);

    return response;
  } catch (error) {
    throw createNotionError('updatePage', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Archives (soft deletes) a page
 */
export async function deletePage(pageId: string): Promise<UpdatePageResponse> {
  return updatePage({
    pageId,
    archived: true,
  });
}

/**
 * Restores an archived page
 */
export async function restorePage(pageId: string): Promise<UpdatePageResponse> {
  return updatePage({
    pageId,
    archived: false,
  });
}

/**
 * Gets a page's property value by ID
 */
export async function getPageProperty(
  pageId: string,
  propertyId: string
): Promise<unknown> {
  const client = getNotionClient();

  try {
    await rateLimitedDelay();

    const response = await client.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
    });

    return response;
  } catch (error) {
    throw createNotionError('getPageProperty', { pageId, propertyId }, error);
  }
}
