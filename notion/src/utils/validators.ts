import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

// ============================================
// Type Guards for Notion API Responses
// ============================================

/**
 * Checks if a page response is a full page object (not partial)
 */
export function isFullPage(
  page: { object: 'page' } & Record<string, unknown>
): page is PageObjectResponse {
  return 'properties' in page && 'created_time' in page;
}

/**
 * Checks if a database response is a full database object
 */
export function isFullDatabase(
  database: { object: 'database' } & Record<string, unknown>
): database is DatabaseObjectResponse {
  return 'properties' in database && 'title' in database;
}

/**
 * Checks if a block response is a full block object
 */
export function isFullBlock(
  block: { object: 'block' } & Record<string, unknown>
): block is BlockObjectResponse {
  return 'type' in block && 'created_time' in block;
}

// ============================================
// Property Extractors
// ============================================

type PropertyType =
  | { type: 'title'; title: RichTextItemResponse[] }
  | { type: 'rich_text'; rich_text: RichTextItemResponse[] }
  | { type: 'number'; number: number | null }
  | { type: 'select'; select: { name: string } | null }
  | { type: 'multi_select'; multi_select: { name: string }[] }
  | { type: 'date'; date: { start: string; end: string | null } | null }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: 'url'; url: string | null }
  | { type: 'email'; email: string | null }
  | { type: 'phone_number'; phone_number: string | null }
  | { type: 'created_time'; created_time: string }
  | { type: 'last_edited_time'; last_edited_time: string }
  | { type: 'formula'; formula: { type: string } & Record<string, unknown> }
  | { type: 'rollup'; rollup: { type: string } & Record<string, unknown> }
  | { type: 'people'; people: { id: string }[] }
  | { type: 'files'; files: { name: string }[] }
  | { type: 'relation'; relation: { id: string }[] }
  | { type: 'status'; status: { name: string } | null };

/**
 * Extracts title text from a page property
 */
export function extractTitle(property: PropertyType | undefined): string {
  if (!property || property.type !== 'title') return '';
  return property.title.map(t => ('plain_text' in t ? t.plain_text : '')).join('');
}

/**
 * Extracts rich text as plain string
 */
export function extractRichText(property: PropertyType | undefined): string {
  if (!property || property.type !== 'rich_text') return '';
  return property.rich_text.map(t => ('plain_text' in t ? t.plain_text : '')).join('');
}

/**
 * Extracts number value
 */
export function extractNumber(property: PropertyType | undefined): number | null {
  if (!property || property.type !== 'number') return null;
  return property.number;
}

/**
 * Extracts select value
 */
export function extractSelect(property: PropertyType | undefined): string | null {
  if (!property || property.type !== 'select') return null;
  return property.select?.name ?? null;
}

/**
 * Extracts multi-select values
 */
export function extractMultiSelect(property: PropertyType | undefined): string[] {
  if (!property || property.type !== 'multi_select') return [];
  return property.multi_select.map(s => s.name);
}

/**
 * Extracts date value
 */
export function extractDate(
  property: PropertyType | undefined
): { start: string; end: string | null } | null {
  if (!property || property.type !== 'date') return null;
  return property.date;
}

/**
 * Extracts checkbox value
 */
export function extractCheckbox(property: PropertyType | undefined): boolean {
  if (!property || property.type !== 'checkbox') return false;
  return property.checkbox;
}

/**
 * Extracts URL value
 */
export function extractUrl(property: PropertyType | undefined): string | null {
  if (!property || property.type !== 'url') return null;
  return property.url;
}

/**
 * Extracts status value (similar to select)
 */
export function extractStatus(property: PropertyType | undefined): string | null {
  if (!property || property.type !== 'status') return null;
  return property.status?.name ?? null;
}

// ============================================
// Validation Utilities
// ============================================

/**
 * Validates a Notion ID format (with or without hyphens)
 */
export function isValidNotionId(id: string): boolean {
  // Remove hyphens for validation
  const cleanId = id.replace(/-/g, '');
  return /^[a-f0-9]{32}$/i.test(cleanId);
}

/**
 * Normalizes a Notion ID to the format without hyphens
 */
export function normalizeNotionId(id: string): string {
  return id.replace(/-/g, '');
}

/**
 * Formats a Notion ID with standard hyphen pattern
 */
export function formatNotionId(id: string): string {
  const clean = normalizeNotionId(id);
  // Format: 8-4-4-4-12
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

/**
 * Validates an ISO 8601 date string
 */
export function isValidIsoDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Creates an ISO timestamp for the current time
 */
export function nowIsoTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Formats a date as YYYY-MM-DD
 */
export function formatDateOnly(date: Date = new Date()): string {
  return date.toISOString().split('T')[0] ?? '';
}

/**
 * Formats a date with time as YYYY-MM-DD · HH:MM
 */
export function formatDateWithTime(date: Date = new Date()): string {
  const dateStr = formatDateOnly(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${dateStr} · ${hours}:${minutes}`;
}

// ============================================
// Error Handling Utilities
// ============================================

/**
 * Checks if an error is a Notion API error with specific code
 */
export function isNotionApiError(
  error: unknown,
  code?: string
): error is { code: string; message: string } {
  if (typeof error !== 'object' || error === null) return false;
  if (!('code' in error) || typeof (error as { code: unknown }).code !== 'string') return false;
  if (code && (error as { code: string }).code !== code) return false;
  return true;
}

/**
 * Checks if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  return isNotionApiError(error, 'rate_limited');
}

/**
 * Checks if error is an object not found error
 */
export function isNotFoundError(error: unknown): boolean {
  return isNotionApiError(error, 'object_not_found');
}

/**
 * Checks if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return isNotionApiError(error, 'validation_error');
}
