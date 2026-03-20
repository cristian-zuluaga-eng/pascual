// ============================================
// OpenClaw/PASCUAL Notion Integration Layer
// Main Export File
// ============================================

// Re-export all types
export type {
  // Core types
  NotionClient,
  NotionError,
  NotionBlock,
  RichTextItem,
  TextAnnotations,
  PropertyValue,
  DatabaseFilter,
  DatabaseSort,
  PageObjectResponse,
  BlockObjectResponse,
  CommentObjectResponse,

  // Block types
  ParagraphBlock,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  BulletedListItemBlock,
  NumberedListItemBlock,
  ToDoBlock,
  ToggleBlock,
  CodeBlock,
  QuoteBlock,
  DividerBlock,
  CalloutBlock,
  TableBlock,
  TableRowBlock,
  CodeLanguage,

  // CONDOR types
  PortfolioAsset,
  CondorReport,
  CondorReportInput,
  AlertLevel,
  Sector,
  RiskProfile,
  ConfidenceLevel,

  // IDEAS types
  SoftwareIdea,
  IdeaCreateInput,
  IdeaUpdateInput,
  IdeaStatus,
  TechnicalViability,
  EstimatedTime,
  TechStack,

  // SPORTS types
  SportsMatch,
  MatchAnalysisInput,
  MatchResultInput,
  BacktestingFilters,
  BacktestingResult,
  Sport,
  MatchStatus,
  BetResult,
} from '../types.js';

// Re-export client utilities
export {
  getNotionClient,
  resetClient,
  rateLimitedDelay,
  validateModuleEnv,
  getDatabaseId,
  createNotionError,
} from '../client.js';

// ============================================
// Core Tools
// ============================================

// Markdown conversion
export {
  markdownToBlocks,
  blocksToMarkdown,
} from './core/markdown.js';

// Block operations
export {
  appendBlocks,
  readBlocks,
  readAllBlocks,
  getBlock,
  updateBlock,
  deleteBlock,
  replaceBlocks,
} from './core/blocks.js';

// Page operations
export {
  createPage,
  readPage,
  updatePage,
  deletePage,
  restorePage,
  getPageProperty,
} from './core/pages.js';

// Database operations
export {
  queryDatabase,
  queryAllDatabase,
  createDatabaseEntry,
  updateDatabaseEntry,
  deleteDatabaseEntry,
  getDatabaseSchema,
  // Property builders
  titleProperty,
  richTextProperty,
  numberProperty,
  selectProperty,
  multiSelectProperty,
  dateProperty,
  checkboxProperty,
  urlProperty,
  emailProperty,
  phoneProperty,
} from './core/databases.js';

// Comment operations
export {
  addComment,
  listComments,
  listAllComments,
  getCommentText,
  getCommentMetadata,
} from './core/comments.js';

// ============================================
// Module Tools
// ============================================

// CONDOR Module - Portfolio & Market Analysis
export {
  // Portfolio
  readPortfolio,
  readPortfolioBySector,
  readPortfolioByRisk,
  getAssetByTicker,
  updateAssetNotes,
  // Reports
  writeCondorReport,
  setAlertLevel,
  listRecentReports,
  getReportsByAlertLevel,
  getReportContent,
} from './modules/condor.js';

// IDEAS Module - Software Ideas Management
export {
  // CRUD
  listNewIdeas,
  listIdeasByStatus,
  listAllIdeas,
  getIdea,
  createIdea,
  updateIdeaStatus,
  getIdeaContent,
  // Prototypes
  writePrototype,
  appendToPrototype,
  // Evaluation
  addEvaluationComment,
  getEvaluationComments,
  approveIdea,
  rejectIdea,
  startDevelopment,
  completeIdea,
} from './modules/ideas.js';

// SPORTS Module - Sports Betting Analysis
export {
  // Match listing
  listPendingMatches,
  listMatchesByStatus,
  listMatchesBySport,
  listUpcomingMatches,
  listAnalyzedPendingResult,
  // Analysis
  writeAnalysis,
  getMatchAnalysis,
  appendMatchNotes,
  // Results
  updateResult,
  updateMultipleResults,
  // Backtesting
  getBacktestingData,
  getROIBySport,
  getMonthlyPerformance,
} from './modules/sports.js';

// ============================================
// Utility Exports
// ============================================

// Block builders
export {
  text,
  styledText,
  bold,
  italic,
  code,
  strikethrough,
  link,
  paragraph,
  textParagraph,
  heading1,
  textHeading1,
  heading2,
  textHeading2,
  heading3,
  textHeading3,
  bulletedListItem,
  textBulletedListItem,
  numberedListItem,
  textNumberedListItem,
  toDo,
  textToDo,
  codeBlock,
  quote,
  textQuote,
  divider,
  callout,
  textCallout,
  tableRow,
  textTableRow,
  table,
  textTable,
  richTextToPlain,
  blocksToApiFormat,
} from '../utils/notion-blocks.js';

// Validators
export {
  isFullPage,
  isFullDatabase,
  isFullBlock,
  extractTitle,
  extractRichText,
  extractNumber,
  extractSelect,
  extractMultiSelect,
  extractDate,
  extractCheckbox,
  extractUrl,
  extractStatus,
  isValidNotionId,
  normalizeNotionId,
  formatNotionId,
  isValidIsoDate,
  nowIsoTimestamp,
  formatDateOnly,
  formatDateWithTime,
  isNotionApiError,
  isRateLimitError,
  isNotFoundError,
  isValidationError,
} from '../utils/validators.js';
