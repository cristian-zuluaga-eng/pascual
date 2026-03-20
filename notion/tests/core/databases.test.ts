import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  queryDatabase,
  createDatabaseEntry,
  updateDatabaseEntry,
  deleteDatabaseEntry,
  titleProperty,
  richTextProperty,
  numberProperty,
  selectProperty,
  multiSelectProperty,
  dateProperty,
} from '../../src/tools/core/databases.js';
import { resetClient } from '../../src/client.js';

// Mock the Notion client
vi.mock('@notionhq/client', () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      databases: {
        query: vi.fn().mockResolvedValue({
          object: 'list',
          results: [
            {
              object: 'page',
              id: 'entry-1',
              created_time: '2024-01-01T00:00:00.000Z',
              last_edited_time: '2024-01-01T00:00:00.000Z',
              properties: {
                Name: { type: 'title', title: [{ plain_text: 'Entry 1' }] },
                Status: { type: 'select', select: { name: 'Active' } },
              },
            },
            {
              object: 'page',
              id: 'entry-2',
              created_time: '2024-01-01T00:00:00.000Z',
              last_edited_time: '2024-01-01T00:00:00.000Z',
              properties: {
                Name: { type: 'title', title: [{ plain_text: 'Entry 2' }] },
                Status: { type: 'select', select: { name: 'Inactive' } },
              },
            },
          ],
          has_more: false,
          next_cursor: null,
        }),
        retrieve: vi.fn().mockResolvedValue({
          object: 'database',
          id: 'db-123',
          title: [{ plain_text: 'Test Database' }],
          properties: {},
        }),
      },
      pages: {
        create: vi.fn().mockResolvedValue({
          object: 'page',
          id: 'new-entry',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          properties: {},
        }),
        update: vi.fn().mockResolvedValue({
          object: 'page',
          id: 'entry-1',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          archived: false,
          properties: {},
        }),
      },
    })),
  };
});

describe('databases', () => {
  beforeEach(() => {
    vi.stubEnv('NOTION_TOKEN', 'secret_test_token_12345678901234567890');
    resetClient();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetClient();
  });

  describe('queryDatabase', () => {
    it('validates database ID format', async () => {
      await expect(queryDatabase({ databaseId: 'invalid' })).rejects.toThrow(
        'Invalid database ID format'
      );
    });

    it('queries database and returns results', async () => {
      const result = await queryDatabase({
        databaseId: '12345678901234567890123456789012',
      });

      expect(result.results).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('accepts filter parameter', async () => {
      const result = await queryDatabase({
        databaseId: '12345678901234567890123456789012',
        filter: {
          property: 'Status',
          select: { equals: 'Active' },
        },
      });

      expect(result.results).toBeDefined();
    });

    it('accepts sorts parameter', async () => {
      const result = await queryDatabase({
        databaseId: '12345678901234567890123456789012',
        sorts: [{ property: 'Name', direction: 'ascending' }],
      });

      expect(result.results).toBeDefined();
    });
  });

  describe('createDatabaseEntry', () => {
    it('validates database ID format', async () => {
      await expect(
        createDatabaseEntry({
          databaseId: 'invalid',
          properties: {},
        })
      ).rejects.toThrow('Invalid database ID format');
    });

    it('creates an entry with properties', async () => {
      const result = await createDatabaseEntry({
        databaseId: '12345678901234567890123456789012',
        properties: {
          Name: titleProperty('New Entry'),
          Description: richTextProperty('Test description'),
          Count: numberProperty(42),
        },
      });

      expect(result).toMatchObject({
        object: 'page',
        id: 'new-entry',
      });
    });
  });

  describe('updateDatabaseEntry', () => {
    it('validates page ID format', async () => {
      await expect(
        updateDatabaseEntry({
          pageId: 'invalid',
          properties: {},
        })
      ).rejects.toThrow('Invalid page ID format');
    });

    it('updates entry properties', async () => {
      const result = await updateDatabaseEntry({
        pageId: '12345678901234567890123456789012',
        properties: {
          Status: selectProperty('Complete'),
        },
      });

      expect(result).toMatchObject({
        object: 'page',
        id: 'entry-1',
      });
    });
  });

  describe('deleteDatabaseEntry', () => {
    it('archives the entry', async () => {
      const result = await deleteDatabaseEntry('12345678901234567890123456789012');

      expect(result).toMatchObject({
        object: 'page',
      });
    });
  });

  describe('property builders', () => {
    it('titleProperty creates correct structure', () => {
      const prop = titleProperty('Test Title');
      expect(prop).toEqual({
        type: 'title',
        title: [{ type: 'text', text: { content: 'Test Title' } }],
      });
    });

    it('richTextProperty creates correct structure', () => {
      const prop = richTextProperty('Test text');
      expect(prop).toEqual({
        type: 'rich_text',
        rich_text: [{ type: 'text', text: { content: 'Test text' } }],
      });
    });

    it('numberProperty creates correct structure', () => {
      const prop = numberProperty(42);
      expect(prop).toEqual({
        type: 'number',
        number: 42,
      });

      const nullProp = numberProperty(null);
      expect(nullProp).toEqual({
        type: 'number',
        number: null,
      });
    });

    it('selectProperty creates correct structure', () => {
      const prop = selectProperty('Option A');
      expect(prop).toEqual({
        type: 'select',
        select: { name: 'Option A' },
      });

      const nullProp = selectProperty(null);
      expect(nullProp).toEqual({
        type: 'select',
        select: null,
      });
    });

    it('multiSelectProperty creates correct structure', () => {
      const prop = multiSelectProperty(['A', 'B', 'C']);
      expect(prop).toEqual({
        type: 'multi_select',
        multi_select: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      });
    });

    it('dateProperty creates correct structure', () => {
      const prop = dateProperty('2024-01-01');
      expect(prop).toEqual({
        type: 'date',
        date: { start: '2024-01-01', end: null },
      });

      const rangeProp = dateProperty('2024-01-01', '2024-01-31');
      expect(rangeProp).toEqual({
        type: 'date',
        date: { start: '2024-01-01', end: '2024-01-31' },
      });
    });
  });
});
