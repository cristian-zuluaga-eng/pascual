import type {
  PageObjectResponse,
  QueryDatabaseResponse,
  CreatePageResponse,
  UpdatePageResponse,
  DatabaseFilter,
  DatabaseSort,
  PropertyValue,
  NotionBlock,
} from '../../types.js';
import { getNotionClient, rateLimitedDelay, createNotionError } from '../../client.js';
import { isValidNotionId } from '../../utils/validators.js';
import { blocksToApiFormat } from '../../utils/notion-blocks.js';

// ============================================
// Database Operations
// ============================================

export interface QueryDatabaseParams {
  databaseId: string;
  filter?: DatabaseFilter;
  sorts?: DatabaseSort[];
  pageSize?: number;
  startCursor?: string;
}

export interface QueryDatabaseResult {
  results: PageObjectResponse[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface CreateDatabaseEntryParams {
  databaseId: string;
  properties: Record<string, PropertyValue>;
  content?: NotionBlock[];
  icon?: { emoji: string } | { external: { url: string } };
}

export interface UpdateDatabaseEntryParams {
  pageId: string;
  properties: Record<string, PropertyValue>;
}

/**
 * Queries a database with optional filters and sorting
 */
export async function queryDatabase(params: QueryDatabaseParams): Promise<QueryDatabaseResult> {
  const client = getNotionClient();
  const { databaseId, filter, sorts, pageSize = 100, startCursor } = params;

  if (!isValidNotionId(databaseId)) {
    throw new Error(`Invalid database ID format: ${databaseId}`);
  }

  try {
    await rateLimitedDelay();

    const queryParams: Parameters<typeof client.databases.query>[0] = {
      database_id: databaseId,
      page_size: pageSize,
    };

    if (filter) {
      queryParams.filter = filter as Parameters<typeof client.databases.query>[0]['filter'];
    }

    if (sorts && sorts.length > 0) {
      queryParams.sorts = sorts as Parameters<typeof client.databases.query>[0]['sorts'];
    }

    if (startCursor) {
      queryParams.start_cursor = startCursor;
    }

    const response: QueryDatabaseResponse = await client.databases.query(queryParams);

    const results = response.results.filter(
      (page): page is PageObjectResponse => page.object === 'page' && 'properties' in page
    );

    return {
      results,
      hasMore: response.has_more,
      nextCursor: response.next_cursor,
    };
  } catch (error) {
    throw createNotionError('queryDatabase', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Queries all entries from a database (handles pagination)
 */
export async function queryAllDatabase(
  databaseId: string,
  filter?: DatabaseFilter,
  sorts?: DatabaseSort[]
): Promise<PageObjectResponse[]> {
  const allResults: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const result = await queryDatabase({
      databaseId,
      filter,
      sorts,
      startCursor: cursor,
    });

    allResults.push(...result.results);
    cursor = result.nextCursor ?? undefined;
  } while (cursor);

  return allResults;
}

/**
 * Creates a new entry in a database
 */
export async function createDatabaseEntry(params: CreateDatabaseEntryParams): Promise<CreatePageResponse> {
  const client = getNotionClient();
  const { databaseId, properties, content, icon } = params;

  if (!isValidNotionId(databaseId)) {
    throw new Error(`Invalid database ID format: ${databaseId}`);
  }

  try {
    await rateLimitedDelay();

    const createParams: Parameters<typeof client.pages.create>[0] = {
      parent: { database_id: databaseId },
      properties: properties as Parameters<typeof client.pages.create>[0]['properties'],
    };

    if (icon) {
      if ('emoji' in icon) {
        createParams.icon = { type: 'emoji', emoji: icon.emoji as Parameters<typeof client.pages.create>[0]['icon'] extends { emoji: infer E } ? E : never };
      } else {
        createParams.icon = { type: 'external', external: icon.external };
      }
    }

    if (content && content.length > 0) {
      createParams.children = blocksToApiFormat(content) as Parameters<typeof client.pages.create>[0]['children'];
    }

    const response = await client.pages.create(createParams);

    return response;
  } catch (error) {
    throw createNotionError('createDatabaseEntry', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Updates an existing database entry
 */
export async function updateDatabaseEntry(params: UpdateDatabaseEntryParams): Promise<UpdatePageResponse> {
  const client = getNotionClient();
  const { pageId, properties } = params;

  if (!isValidNotionId(pageId)) {
    throw new Error(`Invalid page ID format: ${pageId}`);
  }

  try {
    await rateLimitedDelay();

    const response = await client.pages.update({
      page_id: pageId,
      properties: properties as Parameters<typeof client.pages.update>[0]['properties'],
    });

    return response;
  } catch (error) {
    throw createNotionError('updateDatabaseEntry', params as unknown as Record<string, unknown>, error);
  }
}

/**
 * Archives (soft deletes) a database entry
 */
export async function deleteDatabaseEntry(pageId: string): Promise<UpdatePageResponse> {
  const client = getNotionClient();

  if (!isValidNotionId(pageId)) {
    throw new Error(`Invalid page ID format: ${pageId}`);
  }

  try {
    await rateLimitedDelay();

    const response = await client.pages.update({
      page_id: pageId,
      archived: true,
    });

    return response;
  } catch (error) {
    throw createNotionError('deleteDatabaseEntry', { pageId }, error);
  }
}

/**
 * Gets database schema/metadata
 */
export async function getDatabaseSchema(databaseId: string): Promise<Record<string, unknown>> {
  const client = getNotionClient();

  if (!isValidNotionId(databaseId)) {
    throw new Error(`Invalid database ID format: ${databaseId}`);
  }

  try {
    await rateLimitedDelay();

    const response = await client.databases.retrieve({
      database_id: databaseId,
    });

    return response as Record<string, unknown>;
  } catch (error) {
    throw createNotionError('getDatabaseSchema', { databaseId }, error);
  }
}

// ============================================
// Property Builders for Database Entries
// ============================================

/**
 * Creates a title property value
 */
export function titleProperty(text: string): PropertyValue {
  return {
    type: 'title',
    title: [{ type: 'text', text: { content: text } }],
  };
}

/**
 * Creates a rich text property value
 */
export function richTextProperty(text: string): PropertyValue {
  return {
    type: 'rich_text',
    rich_text: [{ type: 'text', text: { content: text } }],
  };
}

/**
 * Creates a number property value
 */
export function numberProperty(value: number | null): PropertyValue {
  return {
    type: 'number',
    number: value,
  };
}

/**
 * Creates a select property value
 */
export function selectProperty(name: string | null): PropertyValue {
  return {
    type: 'select',
    select: name ? { name } : null,
  };
}

/**
 * Creates a multi-select property value
 */
export function multiSelectProperty(names: string[]): PropertyValue {
  return {
    type: 'multi_select',
    multi_select: names.map(name => ({ name })),
  };
}

/**
 * Creates a date property value
 */
export function dateProperty(start: string, end?: string | null): PropertyValue {
  return {
    type: 'date',
    date: { start, end: end ?? null },
  };
}

/**
 * Creates a checkbox property value
 */
export function checkboxProperty(checked: boolean): PropertyValue {
  return {
    type: 'checkbox',
    checkbox: checked,
  };
}

/**
 * Creates a URL property value
 */
export function urlProperty(url: string | null): PropertyValue {
  return {
    type: 'url',
    url,
  };
}

/**
 * Creates an email property value
 */
export function emailProperty(email: string | null): PropertyValue {
  return {
    type: 'email',
    email,
  };
}

/**
 * Creates a phone number property value
 */
export function phoneProperty(phone: string | null): PropertyValue {
  return {
    type: 'phone_number',
    phone_number: phone,
  };
}
