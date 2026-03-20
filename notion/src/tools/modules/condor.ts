import type {
  PortfolioAsset,
  CondorReport,
  CondorReportInput,
  AlertLevel,
  Sector,
  RiskProfile,
  ConfidenceLevel,
  PageObjectResponse,
} from '../../types.js';
import { getDatabaseId, validateModuleEnv } from '../../client.js';
import {
  queryDatabase,
  queryAllDatabase,
  createDatabaseEntry,
  updateDatabaseEntry,
  titleProperty,
  richTextProperty,
  numberProperty,
  selectProperty,
  multiSelectProperty,
  dateProperty,
} from '../core/databases.js';
import { appendBlocks, readAllBlocks } from '../core/blocks.js';
import { markdownToBlocks, blocksToMarkdown } from '../core/markdown.js';
import {
  extractTitle,
  extractRichText,
  extractNumber,
  extractSelect,
  extractMultiSelect,
  extractDate,
  formatDateWithTime,
} from '../../utils/validators.js';

// ============================================
// CONDOR Module - Portfolio & Market Analysis
// ============================================

/**
 * Validates CONDOR module environment variables
 */
function ensureCondorEnv(): void {
  validateModuleEnv('condor');
}

/**
 * Gets the CONDOR Config database ID
 */
function getConfigDbId(): string {
  ensureCondorEnv();
  return getDatabaseId('CONDOR_CONFIG_DB_ID');
}

/**
 * Gets the CONDOR Reports database ID
 */
function getReportsDbId(): string {
  ensureCondorEnv();
  return getDatabaseId('CONDOR_REPORTS_DB_ID');
}

// ============================================
// Portfolio Operations
// ============================================

/**
 * Reads all assets from the portfolio configuration database
 */
export async function readPortfolio(): Promise<PortfolioAsset[]> {
  const databaseId = getConfigDbId();

  const results = await queryAllDatabase(databaseId);

  return results.map(pageToPortfolioAsset);
}

/**
 * Reads portfolio assets filtered by sector
 */
export async function readPortfolioBySector(sector: Sector): Promise<PortfolioAsset[]> {
  const databaseId = getConfigDbId();

  const results = await queryAllDatabase(databaseId, {
    property: 'Sector',
    select: { equals: sector },
  });

  return results.map(pageToPortfolioAsset);
}

/**
 * Reads portfolio assets filtered by risk profile
 */
export async function readPortfolioByRisk(riskProfile: RiskProfile): Promise<PortfolioAsset[]> {
  const databaseId = getConfigDbId();

  const results = await queryAllDatabase(databaseId, {
    property: 'Perfil Riesgo',
    select: { equals: riskProfile },
  });

  return results.map(pageToPortfolioAsset);
}

/**
 * Gets a single asset by ticker
 */
export async function getAssetByTicker(ticker: string): Promise<PortfolioAsset | null> {
  const databaseId = getConfigDbId();

  const result = await queryDatabase({
    databaseId,
    filter: {
      property: 'Ticker',
      rich_text: { equals: ticker.toUpperCase() },
    },
    pageSize: 1,
  });

  if (result.results.length === 0) return null;

  const page = result.results[0];
  if (!page) return null;

  return pageToPortfolioAsset(page);
}

/**
 * Updates an asset's notes
 */
export async function updateAssetNotes(
  assetId: string,
  notes: string
): Promise<void> {
  await updateDatabaseEntry({
    pageId: assetId,
    properties: {
      Notas: richTextProperty(notes),
    },
  });
}

/**
 * Converts a Notion page to a PortfolioAsset
 */
function pageToPortfolioAsset(page: PageObjectResponse): PortfolioAsset {
  const props = page.properties;

  return {
    id: page.id,
    nombre: extractTitle(props['Nombre'] as Parameters<typeof extractTitle>[0]),
    ticker: extractRichText(props['Ticker'] as Parameters<typeof extractRichText>[0]),
    sector: (extractSelect(props['Sector'] as Parameters<typeof extractSelect>[0]) ?? 'Tecnología') as Sector,
    cantidad: extractNumber(props['Cantidad'] as Parameters<typeof extractNumber>[0]) ?? 0,
    precioCompra: extractNumber(props['Precio Compra'] as Parameters<typeof extractNumber>[0]) ?? 0,
    pesoObjetivo: extractNumber(props['Peso Objetivo'] as Parameters<typeof extractNumber>[0]) ?? 0,
    perfilRiesgo: (extractSelect(props['Perfil Riesgo'] as Parameters<typeof extractSelect>[0]) ?? 'Moderado') as RiskProfile,
    notas: extractRichText(props['Notas'] as Parameters<typeof extractRichText>[0]),
  };
}

// ============================================
// Reports Operations
// ============================================

/**
 * Writes a new CONDOR report to the database
 * Implements idempotency: checks for existing report with same timestamp
 */
export async function writeCondorReport(input: CondorReportInput): Promise<CondorReport> {
  const databaseId = getReportsDbId();
  const now = new Date();
  const titulo = `CONDOR · ${formatDateWithTime(now)}`;
  const fechaIso = now.toISOString();

  // Check for duplicate report (idempotency)
  const existingReports = await queryDatabase({
    databaseId,
    filter: {
      property: 'Título',
      title: { equals: titulo },
    },
    pageSize: 1,
  });

  if (existingReports.results.length > 0) {
    const existing = existingReports.results[0];
    if (!existing) {
      throw new Error('Unexpected: query returned results but first element is undefined');
    }
    // Return existing report instead of creating duplicate
    return pageToCondorReport(existing);
  }

  // Create new report
  const response = await createDatabaseEntry({
    databaseId,
    properties: {
      'Título': titleProperty(titulo),
      'Fecha': dateProperty(fechaIso),
      'Nivel Alerta': selectProperty(input.nivelAlerta),
      'Activos Afectados': multiSelectProperty(input.activosAfectados),
      'Oportunidades': numberProperty(input.oportunidades),
      'Confianza': selectProperty(input.confianza),
    },
    icon: { emoji: getAlertEmoji(input.nivelAlerta) },
  });

  // Add content as page body
  if (input.contenido) {
    const blocks = markdownToBlocks(input.contenido);
    await appendBlocks({ parentId: response.id, blocks });
  }

  return {
    id: response.id,
    titulo,
    fecha: fechaIso,
    nivelAlerta: input.nivelAlerta,
    activosAfectados: input.activosAfectados,
    oportunidades: input.oportunidades,
    confianza: input.confianza,
    contenido: input.contenido,
  };
}

/**
 * Sets the alert level for an existing report
 */
export async function setAlertLevel(
  reportId: string,
  level: AlertLevel
): Promise<void> {
  await updateDatabaseEntry({
    pageId: reportId,
    properties: {
      'Nivel Alerta': selectProperty(level),
    },
  });
}

/**
 * Lists recent CONDOR reports
 */
export async function listRecentReports(limit = 10): Promise<CondorReport[]> {
  const databaseId = getReportsDbId();

  const result = await queryDatabase({
    databaseId,
    sorts: [{ property: 'Fecha', direction: 'descending' }],
    pageSize: limit,
  });

  return result.results.map(pageToCondorReport);
}

/**
 * Gets reports filtered by alert level
 */
export async function getReportsByAlertLevel(level: AlertLevel): Promise<CondorReport[]> {
  const databaseId = getReportsDbId();

  const results = await queryAllDatabase(
    databaseId,
    { property: 'Nivel Alerta', select: { equals: level } },
    [{ property: 'Fecha', direction: 'descending' }]
  );

  return results.map(pageToCondorReport);
}

/**
 * Gets the full content of a report (including page body)
 */
export async function getReportContent(reportId: string): Promise<string> {
  const blocks = await readAllBlocks(reportId);
  return blocksToMarkdown(blocks);
}

/**
 * Converts a Notion page to a CondorReport
 */
function pageToCondorReport(page: PageObjectResponse): CondorReport {
  const props = page.properties;
  const dateVal = extractDate(props['Fecha'] as Parameters<typeof extractDate>[0]);

  return {
    id: page.id,
    titulo: extractTitle(props['Título'] as Parameters<typeof extractTitle>[0]),
    fecha: dateVal?.start ?? '',
    nivelAlerta: (extractSelect(props['Nivel Alerta'] as Parameters<typeof extractSelect>[0]) ?? 'Verde') as AlertLevel,
    activosAfectados: extractMultiSelect(props['Activos Afectados'] as Parameters<typeof extractMultiSelect>[0]),
    oportunidades: extractNumber(props['Oportunidades'] as Parameters<typeof extractNumber>[0]) ?? 0,
    confianza: (extractSelect(props['Confianza'] as Parameters<typeof extractSelect>[0]) ?? 'Media') as ConfidenceLevel,
    contenido: '', // Content loaded separately via getReportContent
  };
}

/**
 * Gets the appropriate emoji for an alert level
 */
function getAlertEmoji(level: AlertLevel): string {
  const emojis: Record<AlertLevel, string> = {
    Verde: '🟢',
    Amarillo: '🟡',
    Naranja: '🟠',
    Rojo: '🔴',
  };
  return emojis[level];
}
