import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetClient } from '../../src/client.js';

// Mock the Notion client
const mockQuery = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockAppend = vi.fn();
const mockList = vi.fn();
const mockDelete = vi.fn();
const mockCommentCreate = vi.fn();
const mockCommentList = vi.fn();

vi.mock('@notionhq/client', () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      databases: {
        query: mockQuery,
      },
      pages: {
        create: mockCreate,
        update: mockUpdate,
      },
      blocks: {
        children: {
          append: mockAppend,
          list: mockList,
        },
        delete: mockDelete,
      },
      comments: {
        create: mockCommentCreate,
        list: mockCommentList,
      },
    })),
  };
});

// Import after mocking
import {
  listNewIdeas,
  listIdeasByStatus,
  createIdea,
  updateIdeaStatus,
  writePrototype,
  addEvaluationComment,
  approveIdea,
  rejectIdea,
} from '../../src/tools/modules/ideas.js';

describe('ideas module', () => {
  beforeEach(() => {
    vi.stubEnv('NOTION_TOKEN', 'secret_test_token_12345678901234567890');
    vi.stubEnv('IDEAS_DB_ID', '12345678901234567890123456789012');
    resetClient();

    // Reset mocks
    mockQuery.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockAppend.mockReset();
    mockList.mockReset();
    mockDelete.mockReset();
    mockCommentCreate.mockReset();
    mockCommentList.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetClient();
  });

  describe('listNewIdeas', () => {
    it('returns ideas with status "Nueva"', async () => {
      mockQuery.mockResolvedValue({
        results: [
          {
            object: 'page',
            id: 'idea-1',
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            properties: {
              Nombre: { type: 'title', title: [{ plain_text: 'AI Dashboard' }] },
              Estado: { type: 'select', select: { name: 'Nueva' } },
              'Viabilidad Técnica': { type: 'select', select: { name: 'Alta' } },
              'Tiempo Estimado': { type: 'select', select: { name: '2-4 semanas' } },
              'Stack Sugerido': { type: 'multi_select', multi_select: [{ name: 'React' }, { name: 'Node' }] },
              Iteración: { type: 'number', number: 1 },
              'Fecha Creación': { type: 'date', date: { start: '2024-01-01' } },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      });

      const ideas = await listNewIdeas();

      expect(ideas).toHaveLength(1);
      expect(ideas[0]).toMatchObject({
        id: 'idea-1',
        nombre: 'AI Dashboard',
        estado: 'Nueva',
        viabilidadTecnica: 'Alta',
        tiempoEstimado: '2-4 semanas',
        stackSugerido: ['React', 'Node'],
        iteracion: 1,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { property: 'Estado', select: { equals: 'Nueva' } },
        })
      );
    });
  });

  describe('listIdeasByStatus', () => {
    it('filters by specified status', async () => {
      mockQuery.mockResolvedValue({
        results: [],
        has_more: false,
        next_cursor: null,
      });

      await listIdeasByStatus('En Desarrollo');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { property: 'Estado', select: { equals: 'En Desarrollo' } },
        })
      );
    });
  });

  describe('createIdea', () => {
    it('creates a new idea with initial values', async () => {
      mockCreate.mockResolvedValueOnce({
        object: 'page',
        id: 'new-idea',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-01T00:00:00.000Z',
        properties: {},
      });

      mockAppend.mockResolvedValueOnce({ results: [] });

      const idea = await createIdea({
        nombre: 'New Project',
        viabilidadTecnica: 'Media',
        tiempoEstimado: '1-3 meses',
        stackSugerido: ['Python', 'PostgreSQL'],
        contenido: '# Project Description\n\nDetails here.',
      });

      expect(idea).toMatchObject({
        id: 'new-idea',
        nombre: 'New Project',
        estado: 'Nueva',
        viabilidadTecnica: 'Media',
        tiempoEstimado: '1-3 meses',
        stackSugerido: ['Python', 'PostgreSQL'],
        iteracion: 1,
      });

      expect(mockCreate).toHaveBeenCalled();
      expect(mockAppend).toHaveBeenCalled();
    });
  });

  describe('updateIdeaStatus', () => {
    it('updates idea status', async () => {
      mockUpdate.mockResolvedValueOnce({
        object: 'page',
        id: 'idea-1',
        properties: {},
      });

      await updateIdeaStatus({
        ideaId: '12345678901234567890123456789012',
        estado: 'Aprobada',
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          page_id: '12345678901234567890123456789012',
          properties: expect.objectContaining({
            Estado: { type: 'select', select: { name: 'Aprobada' } },
          }),
        })
      );
    });

    it('updates multiple properties', async () => {
      mockUpdate.mockResolvedValueOnce({
        object: 'page',
        id: 'idea-1',
        properties: {},
      });

      await updateIdeaStatus({
        ideaId: '12345678901234567890123456789012',
        viabilidadTecnica: 'Baja',
        tiempoEstimado: '3+ meses',
        iteracion: 5,
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            'Viabilidad Técnica': { type: 'select', select: { name: 'Baja' } },
            'Tiempo Estimado': { type: 'select', select: { name: '3+ meses' } },
            Iteración: { type: 'number', number: 5 },
          }),
        })
      );
    });
  });

  describe('writePrototype', () => {
    const validIdeaId = '12345678901234567890123456789012';
    const validBlockId = 'abcdef01234567890123456789012345';

    it('increments iteration and replaces content', async () => {
      // Mock getIdea query
      mockQuery.mockResolvedValueOnce({
        results: [
          {
            object: 'page',
            id: validIdeaId,
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            properties: {
              Nombre: { type: 'title', title: [{ plain_text: 'Test Idea' }] },
              Estado: { type: 'select', select: { name: 'Nueva' } },
              'Viabilidad Técnica': { type: 'select', select: { name: 'Alta' } },
              'Tiempo Estimado': { type: 'select', select: { name: '1 semana' } },
              'Stack Sugerido': { type: 'multi_select', multi_select: [] },
              Iteración: { type: 'number', number: 2 },
              'Fecha Creación': { type: 'date', date: { start: '2024-01-01' } },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      });

      // Mock updateIdeaStatus
      mockUpdate.mockResolvedValue({
        object: 'page',
        id: validIdeaId,
        properties: {},
      });

      // Mock readAllBlocks (for replaceBlocks)
      mockList.mockResolvedValue({
        results: [
          { object: 'block', id: validBlockId, type: 'paragraph' },
        ],
        has_more: false,
        next_cursor: null,
      });

      // Mock deleteBlock
      mockDelete.mockResolvedValue({
        object: 'block',
        id: validBlockId,
      });

      // Mock appendBlocks
      mockAppend.mockResolvedValue({ results: [] });

      const newIteration = await writePrototype(
        validIdeaId,
        '## New Prototype\n\nContent here.'
      );

      expect(newIteration).toBe(3); // Previous was 2, now 3
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('throws error if idea not found', async () => {
      mockQuery.mockResolvedValueOnce({
        results: [],
        has_more: false,
        next_cursor: null,
      });

      await expect(writePrototype(validIdeaId, 'content')).rejects.toThrow(
        'Idea not found'
      );
    });
  });

  describe('addEvaluationComment', () => {
    it('adds a comment to the idea', async () => {
      mockCommentCreate.mockResolvedValueOnce({
        object: 'comment',
        id: 'comment-1',
        rich_text: [{ plain_text: 'Great idea!' }],
      });

      await addEvaluationComment(
        '12345678901234567890123456789012',
        'Great idea!'
      );

      expect(mockCommentCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: { page_id: '12345678901234567890123456789012' },
          rich_text: [{ type: 'text', text: { content: 'Great idea!' } }],
        })
      );
    });
  });

  describe('approveIdea', () => {
    it('sets status to Aprobada and adds comment', async () => {
      mockUpdate.mockResolvedValue({ object: 'page', id: 'idea-1' });
      mockCommentCreate.mockResolvedValue({ object: 'comment', id: 'c-1' });

      await approveIdea('12345678901234567890123456789012', 'Looks good!');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: {
            Estado: { type: 'select', select: { name: 'Aprobada' } },
          },
        })
      );

      expect(mockCommentCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          rich_text: [{ type: 'text', text: { content: '✅ Aprobada: Looks good!' } }],
        })
      );
    });
  });

  describe('rejectIdea', () => {
    it('sets status to Rechazada and adds reason', async () => {
      mockUpdate.mockResolvedValue({ object: 'page', id: 'idea-1' });
      mockCommentCreate.mockResolvedValue({ object: 'comment', id: 'c-1' });

      await rejectIdea('12345678901234567890123456789012', 'Not feasible');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: {
            Estado: { type: 'select', select: { name: 'Rechazada' } },
          },
        })
      );

      expect(mockCommentCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          rich_text: [{ type: 'text', text: { content: '❌ Rechazada: Not feasible' } }],
        })
      );
    });
  });
});
