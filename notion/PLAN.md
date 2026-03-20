# Notion Integration Layer - OpenClaw/PASCUAL

## Overview

This is a TypeScript integration layer that enables AI agents in the PASCUAL ecosystem to read and write to Notion databases without handling authentication directly.

## Architecture

```
src/
├── client.ts           # Notion client singleton with rate limiting
├── types.ts            # TypeScript interfaces for all structures
├── tools/
│   ├── index.ts        # Barrel export for all tools
│   ├── core/           # Low-level Notion API wrappers
│   │   ├── pages.ts    # Page CRUD operations
│   │   ├── databases.ts # Database query/create operations
│   │   ├── blocks.ts   # Block manipulation
│   │   ├── comments.ts # Comment operations
│   │   └── markdown.ts # Markdown ↔ Notion blocks conversion
│   └── modules/        # High-level domain-specific tools
│       ├── condor.ts   # Portfolio & market analysis
│       ├── ideas.ts    # Software ideas management
│       └── sports.ts   # Sports betting analysis
└── utils/
    ├── notion-blocks.ts # Block builder helpers
    └── validators.ts    # Type guards and extractors
```

## Modules

### CONDOR (Portfolio & Market Analysis)

Tools for managing investment portfolios and market reports.

**Portfolio Tools:**
- `readPortfolio()` - Get all portfolio assets
- `readPortfolioBySector(sector)` - Filter by sector
- `readPortfolioByRisk(profile)` - Filter by risk profile
- `getAssetByTicker(ticker)` - Find specific asset
- `updateAssetNotes(id, notes)` - Update asset notes

**Report Tools:**
- `writeCondorReport(input)` - Create new market report (idempotent)
- `setAlertLevel(reportId, level)` - Update report alert level
- `listRecentReports(limit)` - Get latest reports
- `getReportsByAlertLevel(level)` - Filter reports by alert
- `getReportContent(reportId)` - Get full report content

### IDEAS (Software Ideas Management)

Tools for managing software project ideas and prototypes.

**CRUD Tools:**
- `listNewIdeas()` - Get ideas with status "Nueva"
- `listIdeasByStatus(status)` - Filter by status
- `listAllIdeas()` - Get all ideas
- `getIdea(id)` - Get single idea
- `createIdea(input)` - Create new idea
- `updateIdeaStatus(input)` - Update idea properties
- `getIdeaContent(id)` - Get idea page content

**Prototype Tools:**
- `writePrototype(ideaId, content)` - Write/update prototype (increments iteration)
- `appendToPrototype(ideaId, content)` - Append to existing content

**Evaluation Tools:**
- `addEvaluationComment(ideaId, comment)` - Add evaluation comment
- `getEvaluationComments(ideaId)` - Get all comments
- `approveIdea(ideaId, comment?)` - Approve idea
- `rejectIdea(ideaId, reason)` - Reject with reason
- `startDevelopment(ideaId)` - Mark as in development
- `completeIdea(ideaId, summary?)` - Mark as completed

### SPORTS (Sports Betting Analysis)

Tools for sports betting analysis and backtesting.

**Listing Tools:**
- `listPendingMatches()` - Get matches pending analysis
- `listMatchesByStatus(status)` - Filter by status
- `listMatchesBySport(sport)` - Filter by sport
- `listUpcomingMatches(days)` - Get matches in next N days
- `listAnalyzedPendingResult()` - Get analyzed matches awaiting results

**Analysis Tools:**
- `writeAnalysis(input)` - Write match analysis
- `getMatchAnalysis(matchId)` - Get analysis content
- `appendMatchNotes(matchId, notes)` - Add additional notes

**Result Tools:**
- `updateResult(input)` - Update match result
- `updateMultipleResults(results)` - Bulk update results

**Backtesting Tools:**
- `getBacktestingData(filters)` - Get historical performance data
- `getROIBySport()` - Get ROI breakdown by sport
- `getMonthlyPerformance(year, month)` - Get monthly stats

## Core Tools

### Pages
- `createPage(params)` - Create a new page
- `readPage(pageId)` - Get page by ID
- `updatePage(params)` - Update page properties
- `deletePage(pageId)` - Archive page
- `restorePage(pageId)` - Restore archived page

### Databases
- `queryDatabase(params)` - Query with filters/sorts
- `queryAllDatabase(id, filter?, sorts?)` - Query all (handles pagination)
- `createDatabaseEntry(params)` - Create new entry
- `updateDatabaseEntry(params)` - Update entry
- `deleteDatabaseEntry(pageId)` - Archive entry
- `getDatabaseSchema(id)` - Get database properties

### Blocks
- `appendBlocks(params)` - Append blocks to page/block
- `readBlocks(params)` - Read child blocks
- `readAllBlocks(blockId)` - Read all blocks (paginated)
- `getBlock(blockId)` - Get single block
- `updateBlock(blockId, content)` - Update block
- `deleteBlock(blockId)` - Delete block
- `replaceBlocks(parentId, blocks)` - Replace all content

### Comments
- `addComment(params)` - Add comment to page
- `listComments(params)` - List comments
- `listAllComments(blockId)` - List all comments (paginated)

### Markdown
- `markdownToBlocks(markdown)` - Convert markdown to Notion blocks
- `blocksToMarkdown(blocks)` - Convert Notion blocks to markdown

## Environment Variables

| Variable | Required | Module |
|----------|----------|--------|
| `NOTION_TOKEN` | Yes | All |
| `CONDOR_CONFIG_DB_ID` | Yes | CONDOR |
| `CONDOR_REPORTS_DB_ID` | Yes | CONDOR |
| `IDEAS_DB_ID` | Yes | IDEAS |
| `SPORTS_DB_ID` | Yes | SPORTS |

## Usage

```typescript
import {
  // CONDOR module
  readPortfolio,
  writeCondorReport,

  // IDEAS module
  listNewIdeas,
  createIdea,
  approveIdea,

  // SPORTS module
  listPendingMatches,
  writeAnalysis,
  getBacktestingData,

  // Core tools
  queryDatabase,
  markdownToBlocks,
} from '@openclaw/notion-integration';

// Read portfolio
const assets = await readPortfolio();

// Create a market report
const report = await writeCondorReport({
  nivelAlerta: 'Amarillo',
  activosAfectados: ['NVDA', 'AAPL'],
  oportunidades: 3,
  confianza: 'Alta',
  contenido: '# Market Analysis\n\nDetails here...',
});

// Create a new idea
const idea = await createIdea({
  nombre: 'AI Assistant',
  viabilidadTecnica: 'Alta',
  tiempoEstimado: '2-4 semanas',
  stackSugerido: ['TypeScript', 'React'],
  contenido: '# Project Overview\n\nDescription...',
});

// Get backtesting data
const stats = await getBacktestingData({
  deporte: 'Fútbol',
  confianzaMinima: 70,
});
console.log(`ROI: ${stats.roi}%`);
```

## Key Features

1. **Singleton Client** - Single Notion client instance with automatic rate limiting (333ms between requests)

2. **Module Architecture** - High-level module tools use only core tools (never SDK directly)

3. **Idempotency** - `writeCondorReport` checks for duplicates before creating

4. **Type Safety** - Full TypeScript coverage with strict mode

5. **Markdown Support** - Bidirectional conversion supporting:
   - Headings (h1-h3)
   - Bold, italic, code (inline)
   - Code blocks with language
   - Bulleted and numbered lists
   - Blockquotes
   - Dividers
   - Tables
   - Links

6. **Error Handling** - Errors include full context (tool name, params, original error)

7. **Extensibility** - Add new modules by creating a file in `src/tools/modules/` and adding env vars

## Database Schemas

### CONDOR Config & Portafolio
| Property | Type | Description |
|----------|------|-------------|
| Nombre | Title | Asset name |
| Ticker | Text | Stock symbol |
| Sector | Select | Industry sector |
| Cantidad | Number | Units held |
| Precio Compra | Number | Average purchase price |
| Peso Objetivo | Number | Target portfolio % |
| Perfil Riesgo | Select | Risk profile |
| Notas | Rich Text | Notes |

### CONDOR Reports
| Property | Type | Description |
|----------|------|-------------|
| Título | Title | Auto: "CONDOR · YYYY-MM-DD · HH:MM" |
| Fecha | Date | Report timestamp |
| Nivel Alerta | Select | Verde/Amarillo/Naranja/Rojo |
| Activos Afectados | Multi-select | Affected tickers |
| Oportunidades | Number | Opportunities detected |
| Confianza | Select | Alta/Media/Baja |

### IDEAS de Software
| Property | Type | Description |
|----------|------|-------------|
| Nombre | Title | Idea name |
| Estado | Select | Status (Nueva, En Evaluación, etc.) |
| Viabilidad Técnica | Select | Alta/Media/Baja |
| Tiempo Estimado | Select | Time estimate |
| Stack Sugerido | Multi-select | Suggested technologies |
| Iteración | Number | Prototype iteration count |
| Fecha Creación | Date | Creation date |

### Apuestas Deportivas
| Property | Type | Description |
|----------|------|-------------|
| Partido | Title | Match description |
| Fecha | Date | Event date |
| Estado | Select | Pendiente/Analizado/Resultado Conocido |
| Deporte | Select | Sport type |
| Apuesta Recomendada | Text | Recommended bet |
| Confianza | Number | Confidence % (0-100) |
| EV Esperado | Number | Expected value |
| Resultado Real | Select | Ganada/Perdida/Void/Pendiente |

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build
npm run build
```

## License

MIT
