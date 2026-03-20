import type {
  SportsMatch,
  MatchAnalysisInput,
  MatchResultInput,
  BacktestingFilters,
  BacktestingResult,
  Sport,
  MatchStatus,
  BetResult,
  PageObjectResponse,
} from '../../types.js';
import { getDatabaseId, validateModuleEnv } from '../../client.js';
import {
  queryAllDatabase,
  updateDatabaseEntry,
  richTextProperty,
  numberProperty,
  selectProperty,
} from '../core/databases.js';
import { appendBlocks, readAllBlocks, replaceBlocks } from '../core/blocks.js';
import { markdownToBlocks, blocksToMarkdown } from '../core/markdown.js';
import {
  extractTitle,
  extractRichText,
  extractNumber,
  extractSelect,
  extractDate,
} from '../../utils/validators.js';
import type { DatabaseFilter } from '../../types.js';

// ============================================
// SPORTS Module - Sports Betting Analysis
// ============================================

/**
 * Validates SPORTS module environment variables
 */
function ensureSportsEnv(): void {
  validateModuleEnv('sports');
}

/**
 * Gets the SPORTS database ID
 */
function getSportsDbId(): string {
  ensureSportsEnv();
  return getDatabaseId('SPORTS_DB_ID');
}

// ============================================
// Match Listing Operations
// ============================================

/**
 * Lists all pending matches (not yet analyzed)
 */
export async function listPendingMatches(): Promise<SportsMatch[]> {
  const databaseId = getSportsDbId();

  const results = await queryAllDatabase(
    databaseId,
    { property: 'Estado', select: { equals: 'Pendiente' } },
    [{ property: 'Fecha', direction: 'ascending' }]
  );

  return results.map(pageToSportsMatch);
}

/**
 * Lists matches by status
 */
export async function listMatchesByStatus(status: MatchStatus): Promise<SportsMatch[]> {
  const databaseId = getSportsDbId();

  const results = await queryAllDatabase(
    databaseId,
    { property: 'Estado', select: { equals: status } },
    [{ property: 'Fecha', direction: 'ascending' }]
  );

  return results.map(pageToSportsMatch);
}

/**
 * Lists matches by sport
 */
export async function listMatchesBySport(sport: Sport): Promise<SportsMatch[]> {
  const databaseId = getSportsDbId();

  const results = await queryAllDatabase(
    databaseId,
    { property: 'Deporte', select: { equals: sport } },
    [{ property: 'Fecha', direction: 'ascending' }]
  );

  return results.map(pageToSportsMatch);
}

/**
 * Lists upcoming matches (within next N days)
 */
export async function listUpcomingMatches(days = 7): Promise<SportsMatch[]> {
  const databaseId = getSportsDbId();
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const results = await queryAllDatabase(
    databaseId,
    {
      and: [
        { property: 'Fecha', date: { on_or_after: now.toISOString().split('T')[0] } },
        { property: 'Fecha', date: { on_or_before: future.toISOString().split('T')[0] } },
      ],
    },
    [{ property: 'Fecha', direction: 'ascending' }]
  );

  return results.map(pageToSportsMatch);
}

/**
 * Gets analyzed matches pending results
 */
export async function listAnalyzedPendingResult(): Promise<SportsMatch[]> {
  const databaseId = getSportsDbId();

  const results = await queryAllDatabase(
    databaseId,
    {
      and: [
        { property: 'Estado', select: { equals: 'Analizado' } },
        { property: 'Resultado Real', select: { equals: 'Pendiente' } },
      ],
    },
    [{ property: 'Fecha', direction: 'ascending' }]
  );

  return results.map(pageToSportsMatch);
}

// ============================================
// Analysis Operations
// ============================================

/**
 * Writes analysis for a match
 */
export async function writeAnalysis(input: MatchAnalysisInput): Promise<void> {
  const { matchId, apuestaRecomendada, confianza, evEsperado, analisis } = input;

  // Update match properties
  await updateDatabaseEntry({
    pageId: matchId,
    properties: {
      'Estado': selectProperty('Analizado'),
      'Apuesta Recomendada': richTextProperty(apuestaRecomendada),
      'Confianza': numberProperty(confianza),
      'EV Esperado': numberProperty(evEsperado),
      'Resultado Real': selectProperty('Pendiente'),
    },
  });

  // Add analysis content to page body
  if (analisis) {
    const blocks = markdownToBlocks(analisis);
    await replaceBlocks(matchId, blocks);
  }
}

/**
 * Gets the analysis content for a match
 */
export async function getMatchAnalysis(matchId: string): Promise<string> {
  const blocks = await readAllBlocks(matchId);
  return blocksToMarkdown(blocks);
}

/**
 * Appends additional notes to match analysis
 */
export async function appendMatchNotes(matchId: string, notes: string): Promise<void> {
  const blocks = markdownToBlocks(`\n---\n\n${notes}`);
  await appendBlocks({ parentId: matchId, blocks });
}

// ============================================
// Result Operations
// ============================================

/**
 * Updates the result of a match
 */
export async function updateResult(input: MatchResultInput): Promise<void> {
  const { matchId, resultado } = input;

  await updateDatabaseEntry({
    pageId: matchId,
    properties: {
      'Estado': selectProperty('Resultado Conocido'),
      'Resultado Real': selectProperty(resultado),
    },
  });
}

/**
 * Bulk update results for multiple matches
 */
export async function updateMultipleResults(
  results: MatchResultInput[]
): Promise<void> {
  for (const result of results) {
    await updateResult(result);
  }
}

// ============================================
// Backtesting Operations
// ============================================

/**
 * Gets backtesting data with optional filters
 */
export async function getBacktestingData(
  filters: BacktestingFilters = {}
): Promise<BacktestingResult> {
  const databaseId = getSportsDbId();
  const { deporte, fechaInicio, fechaFin, confianzaMinima } = filters;

  // Build filter conditions
  const conditions: DatabaseFilter[] = [
    { property: 'Estado', select: { equals: 'Resultado Conocido' } },
  ];

  if (deporte) {
    conditions.push({ property: 'Deporte', select: { equals: deporte } });
  }

  if (fechaInicio) {
    conditions.push({ property: 'Fecha', date: { on_or_after: fechaInicio } });
  }

  if (fechaFin) {
    conditions.push({ property: 'Fecha', date: { on_or_before: fechaFin } });
  }

  if (confianzaMinima !== undefined) {
    conditions.push({ property: 'Confianza', number: { greater_than_or_equal_to: confianzaMinima } });
  }

  const filter: DatabaseFilter = conditions.length === 1
    ? conditions[0]!
    : { and: conditions };

  const results = await queryAllDatabase(
    databaseId,
    filter,
    [{ property: 'Fecha', direction: 'ascending' }]
  );

  const matches = results.map(pageToSportsMatch);

  // Calculate statistics
  const stats = calculateBacktestingStats(matches);

  return {
    ...stats,
    matches,
  };
}

/**
 * Gets ROI by sport
 */
export async function getROIBySport(): Promise<Record<Sport, number>> {
  const sports: Sport[] = ['Fútbol', 'Baloncesto', 'Tenis', 'Béisbol', 'Hockey', 'MMA', 'Boxeo', 'eSports'];
  const results: Record<string, number> = {};

  for (const sport of sports) {
    const data = await getBacktestingData({ deporte: sport });
    results[sport] = data.roi;
  }

  return results as Record<Sport, number>;
}

/**
 * Gets monthly performance
 */
export async function getMonthlyPerformance(
  year: number,
  month: number
): Promise<BacktestingResult> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  return getBacktestingData({
    fechaInicio: startDate,
    fechaFin: endDate,
  });
}

// ============================================
// Helpers
// ============================================

/**
 * Converts a Notion page to a SportsMatch
 */
function pageToSportsMatch(page: PageObjectResponse): SportsMatch {
  const props = page.properties;
  const dateVal = extractDate(props['Fecha'] as Parameters<typeof extractDate>[0]);

  return {
    id: page.id,
    partido: extractTitle(props['Partido'] as Parameters<typeof extractTitle>[0]),
    fecha: dateVal?.start ?? '',
    estado: (extractSelect(props['Estado'] as Parameters<typeof extractSelect>[0]) ?? 'Pendiente') as MatchStatus,
    deporte: (extractSelect(props['Deporte'] as Parameters<typeof extractSelect>[0]) ?? 'Fútbol') as Sport,
    apuestaRecomendada: extractRichText(props['Apuesta Recomendada'] as Parameters<typeof extractRichText>[0]),
    confianza: extractNumber(props['Confianza'] as Parameters<typeof extractNumber>[0]) ?? 0,
    evEsperado: extractNumber(props['EV Esperado'] as Parameters<typeof extractNumber>[0]) ?? 0,
    resultadoReal: (extractSelect(props['Resultado Real'] as Parameters<typeof extractSelect>[0]) ?? 'Pendiente') as BetResult,
    contenido: '', // Content loaded separately via getMatchAnalysis
  };
}

/**
 * Calculates backtesting statistics from matches
 */
function calculateBacktestingStats(matches: SportsMatch[]): Omit<BacktestingResult, 'matches'> {
  let ganadas = 0;
  let perdidas = 0;
  let voids = 0;
  let pendientes = 0;
  let totalEV = 0;

  for (const match of matches) {
    switch (match.resultadoReal) {
      case 'Ganada':
        ganadas++;
        break;
      case 'Perdida':
        perdidas++;
        break;
      case 'Void':
        voids++;
        break;
      case 'Pendiente':
        pendientes++;
        break;
    }
    totalEV += match.evEsperado;
  }

  const completedBets = ganadas + perdidas;
  const roi = completedBets > 0
    ? ((ganadas - perdidas) / completedBets) * 100
    : 0;

  const evPromedio = matches.length > 0
    ? totalEV / matches.length
    : 0;

  return {
    totalApuestas: matches.length,
    ganadas,
    perdidas,
    voids,
    pendientes,
    roi: Math.round(roi * 100) / 100,
    evPromedio: Math.round(evPromedio * 100) / 100,
  };
}
