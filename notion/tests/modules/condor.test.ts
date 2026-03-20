import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetClient } from '../../src/client.js';

// Mock the Notion client
const mockQuery = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockAppend = vi.fn();
const mockList = vi.fn();

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
      },
    })),
  };
});

// Import after mocking
import {
  readPortfolio,
  getAssetByTicker,
  writeCondorReport,
  setAlertLevel,
  listRecentReports,
} from '../../src/tools/modules/condor.js';

describe('condor module', () => {
  beforeEach(() => {
    vi.stubEnv('NOTION_TOKEN', 'secret_test_token_12345678901234567890');
    vi.stubEnv('CONDOR_CONFIG_DB_ID', '12345678901234567890123456789012');
    vi.stubEnv('CONDOR_REPORTS_DB_ID', '12345678901234567890123456789013');
    resetClient();

    // Reset mocks
    mockQuery.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockAppend.mockReset();
    mockList.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetClient();
  });

  describe('readPortfolio', () => {
    it('returns portfolio assets', async () => {
      mockQuery.mockResolvedValue({
        results: [
          {
            object: 'page',
            id: 'asset-1',
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            properties: {
              Nombre: { type: 'title', title: [{ plain_text: 'Apple Inc.' }] },
              Ticker: { type: 'rich_text', rich_text: [{ plain_text: 'AAPL' }] },
              Sector: { type: 'select', select: { name: 'Tecnología' } },
              Cantidad: { type: 'number', number: 100 },
              'Precio Compra': { type: 'number', number: 150.50 },
              'Peso Objetivo': { type: 'number', number: 10 },
              'Perfil Riesgo': { type: 'select', select: { name: 'Moderado' } },
              Notas: { type: 'rich_text', rich_text: [{ plain_text: 'Core holding' }] },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      });

      const assets = await readPortfolio();

      expect(assets).toHaveLength(1);
      expect(assets[0]).toMatchObject({
        id: 'asset-1',
        nombre: 'Apple Inc.',
        ticker: 'AAPL',
        sector: 'Tecnología',
        cantidad: 100,
        precioCompra: 150.50,
        pesoObjetivo: 10,
        perfilRiesgo: 'Moderado',
        notas: 'Core holding',
      });
    });
  });

  describe('getAssetByTicker', () => {
    it('returns null when asset not found', async () => {
      mockQuery.mockResolvedValue({
        results: [],
        has_more: false,
        next_cursor: null,
      });

      const asset = await getAssetByTicker('INVALID');

      expect(asset).toBeNull();
    });

    it('returns asset when found', async () => {
      mockQuery.mockResolvedValue({
        results: [
          {
            object: 'page',
            id: 'asset-nvda',
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            properties: {
              Nombre: { type: 'title', title: [{ plain_text: 'NVIDIA' }] },
              Ticker: { type: 'rich_text', rich_text: [{ plain_text: 'NVDA' }] },
              Sector: { type: 'select', select: { name: 'Tecnología' } },
              Cantidad: { type: 'number', number: 50 },
              'Precio Compra': { type: 'number', number: 450 },
              'Peso Objetivo': { type: 'number', number: 15 },
              'Perfil Riesgo': { type: 'select', select: { name: 'Agresivo' } },
              Notas: { type: 'rich_text', rich_text: [] },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      });

      const asset = await getAssetByTicker('NVDA');

      expect(asset).not.toBeNull();
      expect(asset?.ticker).toBe('NVDA');
      expect(asset?.nombre).toBe('NVIDIA');
    });
  });

  describe('writeCondorReport', () => {
    it('creates a new report', async () => {
      // First query: check for duplicates
      mockQuery.mockResolvedValueOnce({
        results: [],
        has_more: false,
        next_cursor: null,
      });

      // Create response
      mockCreate.mockResolvedValueOnce({
        object: 'page',
        id: 'report-123',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-01T00:00:00.000Z',
        properties: {},
      });

      // Append blocks response
      mockAppend.mockResolvedValueOnce({
        results: [],
      });

      const report = await writeCondorReport({
        nivelAlerta: 'Amarillo',
        activosAfectados: ['AAPL', 'NVDA'],
        oportunidades: 3,
        confianza: 'Alta',
        contenido: '# Market Analysis\n\nSome content here.',
      });

      expect(report).toMatchObject({
        id: 'report-123',
        nivelAlerta: 'Amarillo',
        activosAfectados: ['AAPL', 'NVDA'],
        oportunidades: 3,
        confianza: 'Alta',
      });

      expect(mockCreate).toHaveBeenCalled();
    });

    it('returns existing report if duplicate found (idempotency)', async () => {
      mockQuery.mockResolvedValueOnce({
        results: [
          {
            object: 'page',
            id: 'existing-report',
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            properties: {
              Título: { type: 'title', title: [{ plain_text: 'CONDOR · 2024-01-01 · 12:00' }] },
              Fecha: { type: 'date', date: { start: '2024-01-01T12:00:00.000Z' } },
              'Nivel Alerta': { type: 'select', select: { name: 'Verde' } },
              'Activos Afectados': { type: 'multi_select', multi_select: [{ name: 'AAPL' }] },
              Oportunidades: { type: 'number', number: 1 },
              Confianza: { type: 'select', select: { name: 'Media' } },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      });

      const report = await writeCondorReport({
        nivelAlerta: 'Verde',
        activosAfectados: ['AAPL'],
        oportunidades: 1,
        confianza: 'Media',
        contenido: '',
      });

      expect(report.id).toBe('existing-report');
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('setAlertLevel', () => {
    it('updates the alert level', async () => {
      mockUpdate.mockResolvedValueOnce({
        object: 'page',
        id: 'report-123',
        properties: {},
      });

      await setAlertLevel('12345678901234567890123456789012', 'Rojo');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          page_id: '12345678901234567890123456789012',
          properties: {
            'Nivel Alerta': {
              type: 'select',
              select: { name: 'Rojo' },
            },
          },
        })
      );
    });
  });

  describe('listRecentReports', () => {
    it('returns reports sorted by date descending', async () => {
      mockQuery.mockResolvedValue({
        results: [
          {
            object: 'page',
            id: 'report-2',
            created_time: '2024-01-02T00:00:00.000Z',
            last_edited_time: '2024-01-02T00:00:00.000Z',
            properties: {
              Título: { type: 'title', title: [{ plain_text: 'CONDOR · 2024-01-02 · 10:00' }] },
              Fecha: { type: 'date', date: { start: '2024-01-02' } },
              'Nivel Alerta': { type: 'select', select: { name: 'Verde' } },
              'Activos Afectados': { type: 'multi_select', multi_select: [] },
              Oportunidades: { type: 'number', number: 0 },
              Confianza: { type: 'select', select: { name: 'Alta' } },
            },
          },
          {
            object: 'page',
            id: 'report-1',
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-01T00:00:00.000Z',
            properties: {
              Título: { type: 'title', title: [{ plain_text: 'CONDOR · 2024-01-01 · 09:00' }] },
              Fecha: { type: 'date', date: { start: '2024-01-01' } },
              'Nivel Alerta': { type: 'select', select: { name: 'Amarillo' } },
              'Activos Afectados': { type: 'multi_select', multi_select: [{ name: 'AAPL' }] },
              Oportunidades: { type: 'number', number: 2 },
              Confianza: { type: 'select', select: { name: 'Media' } },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      });

      const reports = await listRecentReports(5);

      expect(reports).toHaveLength(2);
      expect(reports[0]?.id).toBe('report-2');
      expect(reports[1]?.id).toBe('report-1');
    });
  });
});
