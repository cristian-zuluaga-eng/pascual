import { Client } from '@notionhq/client';
import { config } from 'dotenv';

// Load environment variables
config();

// Rate limiting configuration
const RATE_LIMIT_MS = 333; // ~3 requests per second
let lastRequestTime = 0;

/**
 * Ensures we don't exceed Notion's rate limits
 */
export async function rateLimitedDelay(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
}

/**
 * Validates that required environment variables are set
 */
function validateEnv(): void {
  const token = process.env['NOTION_TOKEN'];

  if (!token) {
    throw new Error(
      'NOTION_TOKEN environment variable is required. ' +
      'Get your token from https://www.notion.so/my-integrations'
    );
  }

  if (!token.startsWith('secret_')) {
    throw new Error(
      'NOTION_TOKEN must start with "secret_". ' +
      'Make sure you copied the Internal Integration Token correctly.'
    );
  }
}

/**
 * Validates module-specific environment variables
 */
export function validateModuleEnv(module: 'condor' | 'ideas' | 'sports'): void {
  const requiredVars: Record<string, string[]> = {
    condor: ['CONDOR_CONFIG_DB_ID', 'CONDOR_REPORTS_DB_ID'],
    ideas: ['IDEAS_DB_ID'],
    sports: ['SPORTS_DB_ID'],
  };

  const vars = requiredVars[module];
  if (!vars) {
    throw new Error(`Unknown module: ${module}`);
  }

  const missing = vars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables for ${module} module: ${missing.join(', ')}. ` +
      'Check your .env file.'
    );
  }
}

/**
 * Gets a database ID from environment variables
 */
export function getDatabaseId(key: string): string {
  const id = process.env[key];

  if (!id) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  // Remove any hyphens and validate format (32 hex chars)
  const cleanId = id.replace(/-/g, '');

  if (!/^[a-f0-9]{32}$/i.test(cleanId)) {
    throw new Error(
      `Invalid database ID format for ${key}. ` +
      'Expected 32 hexadecimal characters. ' +
      'Find the ID in the database URL between the last "/" and "?"'
    );
  }

  return id;
}

// Singleton instance
let clientInstance: Client | null = null;

/**
 * Gets the Notion client singleton instance
 * Validates environment on first access
 */
export function getNotionClient(): Client {
  if (!clientInstance) {
    validateEnv();

    clientInstance = new Client({
      auth: process.env['NOTION_TOKEN'],
      timeoutMs: 30000,
    });
  }

  return clientInstance;
}

/**
 * Resets the client instance (useful for testing)
 */
export function resetClient(): void {
  clientInstance = null;
  lastRequestTime = 0;
}

/**
 * Creates a custom error with context
 */
export function createNotionError(
  tool: string,
  params: Record<string, unknown>,
  originalError: unknown
): Error {
  const error = new Error(
    `Notion API error in ${tool}: ${originalError instanceof Error ? originalError.message : String(originalError)}`
  );

  // Attach additional context
  Object.assign(error, {
    tool,
    params,
    originalError,
  });

  return error;
}
