import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPage, readPage, updatePage, deletePage } from '../../src/tools/core/pages.js';
import { resetClient } from '../../src/client.js';

// Mock the Notion client
vi.mock('@notionhq/client', () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      pages: {
        create: vi.fn().mockResolvedValue({
          object: 'page',
          id: 'page-123',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          properties: {},
        }),
        retrieve: vi.fn().mockResolvedValue({
          object: 'page',
          id: 'page-123',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          properties: {
            title: {
              type: 'title',
              title: [{ plain_text: 'Test Page' }],
            },
          },
        }),
        update: vi.fn().mockResolvedValue({
          object: 'page',
          id: 'page-123',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          archived: false,
          properties: {},
        }),
      },
    })),
  };
});

describe('pages', () => {
  beforeEach(() => {
    vi.stubEnv('NOTION_TOKEN', 'secret_test_token_12345678901234567890');
    resetClient();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetClient();
  });

  describe('createPage', () => {
    it('requires either parentPageId or parentDatabaseId', async () => {
      await expect(createPage({ title: 'Test' })).rejects.toThrow(
        'Either parentPageId or parentDatabaseId must be provided'
      );
    });

    it('rejects both parentPageId and parentDatabaseId', async () => {
      await expect(
        createPage({
          title: 'Test',
          parentPageId: 'page123',
          parentDatabaseId: 'db123',
        })
      ).rejects.toThrow('Cannot specify both parentPageId and parentDatabaseId');
    });

    it('creates a page under a database', async () => {
      const result = await createPage({
        title: 'New Page',
        parentDatabaseId: '12345678901234567890123456789012',
      });

      expect(result).toMatchObject({
        object: 'page',
        id: 'page-123',
      });
    });

    it('creates a page under another page', async () => {
      const result = await createPage({
        title: 'Child Page',
        parentPageId: '12345678901234567890123456789012',
      });

      expect(result).toMatchObject({
        object: 'page',
        id: 'page-123',
      });
    });
  });

  describe('readPage', () => {
    it('validates page ID format', async () => {
      await expect(readPage('invalid')).rejects.toThrow('Invalid page ID format');
    });

    it('retrieves a page by ID', async () => {
      const result = await readPage('12345678901234567890123456789012');

      expect(result).toMatchObject({
        object: 'page',
        id: 'page-123',
        properties: {
          title: {
            type: 'title',
            title: [{ plain_text: 'Test Page' }],
          },
        },
      });
    });
  });

  describe('updatePage', () => {
    it('validates page ID format', async () => {
      await expect(updatePage({ pageId: 'invalid' })).rejects.toThrow(
        'Invalid page ID format'
      );
    });

    it('updates page properties', async () => {
      const result = await updatePage({
        pageId: '12345678901234567890123456789012',
        properties: {
          Name: {
            type: 'title',
            title: [{ type: 'text', text: { content: 'Updated' } }],
          },
        },
      });

      expect(result).toMatchObject({
        object: 'page',
        id: 'page-123',
      });
    });
  });

  describe('deletePage', () => {
    it('archives the page', async () => {
      const result = await deletePage('12345678901234567890123456789012');

      expect(result).toMatchObject({
        object: 'page',
        id: 'page-123',
      });
    });
  });
});
