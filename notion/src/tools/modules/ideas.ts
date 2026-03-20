import type {
  SoftwareIdea,
  IdeaCreateInput,
  IdeaUpdateInput,
  IdeaStatus,
  TechnicalViability,
  EstimatedTime,
  TechStack,
  PageObjectResponse,
} from '../../types.js';
import { getDatabaseId, validateModuleEnv } from '../../client.js';
import {
  queryDatabase,
  queryAllDatabase,
  createDatabaseEntry,
  updateDatabaseEntry,
  titleProperty,
  numberProperty,
  selectProperty,
  multiSelectProperty,
  dateProperty,
} from '../core/databases.js';
import { appendBlocks, readAllBlocks, replaceBlocks } from '../core/blocks.js';
import { addComment, listAllComments, getCommentText } from '../core/comments.js';
import { markdownToBlocks, blocksToMarkdown } from '../core/markdown.js';
import {
  extractTitle,
  extractNumber,
  extractSelect,
  extractMultiSelect,
  extractDate,
} from '../../utils/validators.js';

// ============================================
// IDEAS Module - Software Ideas Management
// ============================================

/**
 * Validates IDEAS module environment variables
 */
function ensureIdeasEnv(): void {
  validateModuleEnv('ideas');
}

/**
 * Gets the IDEAS database ID
 */
function getIdeasDbId(): string {
  ensureIdeasEnv();
  return getDatabaseId('IDEAS_DB_ID');
}

// ============================================
// Ideas CRUD Operations
// ============================================

/**
 * Lists all new ideas (status = "Nueva")
 */
export async function listNewIdeas(): Promise<SoftwareIdea[]> {
  const databaseId = getIdeasDbId();

  const results = await queryAllDatabase(
    databaseId,
    { property: 'Estado', select: { equals: 'Nueva' } },
    [{ property: 'Fecha Creación', direction: 'descending' }]
  );

  return results.map(pageToSoftwareIdea);
}

/**
 * Lists ideas by status
 */
export async function listIdeasByStatus(status: IdeaStatus): Promise<SoftwareIdea[]> {
  const databaseId = getIdeasDbId();

  const results = await queryAllDatabase(
    databaseId,
    { property: 'Estado', select: { equals: status } },
    [{ property: 'Fecha Creación', direction: 'descending' }]
  );

  return results.map(pageToSoftwareIdea);
}

/**
 * Lists all ideas
 */
export async function listAllIdeas(): Promise<SoftwareIdea[]> {
  const databaseId = getIdeasDbId();

  const results = await queryAllDatabase(
    databaseId,
    undefined,
    [{ property: 'Fecha Creación', direction: 'descending' }]
  );

  return results.map(pageToSoftwareIdea);
}

/**
 * Gets an idea by ID
 */
export async function getIdea(ideaId: string): Promise<SoftwareIdea | null> {
  const databaseId = getIdeasDbId();

  const result = await queryDatabase({
    databaseId,
    filter: {
      property: 'Nombre',
      title: { is_not_empty: true },
    },
    pageSize: 100,
  });

  const found = result.results.find(page => page.id === ideaId);
  return found ? pageToSoftwareIdea(found) : null;
}

/**
 * Creates a new idea
 */
export async function createIdea(input: IdeaCreateInput): Promise<SoftwareIdea> {
  const databaseId = getIdeasDbId();
  const now = new Date().toISOString();

  const response = await createDatabaseEntry({
    databaseId,
    properties: {
      'Nombre': titleProperty(input.nombre),
      'Estado': selectProperty('Nueva'),
      'Viabilidad Técnica': selectProperty(input.viabilidadTecnica),
      'Tiempo Estimado': selectProperty(input.tiempoEstimado),
      'Stack Sugerido': multiSelectProperty(input.stackSugerido),
      'Iteración': numberProperty(1),
      'Fecha Creación': dateProperty(now),
    },
    icon: { emoji: '💡' },
  });

  // Add content as page body
  if (input.contenido) {
    const blocks = markdownToBlocks(input.contenido);
    await appendBlocks({ parentId: response.id, blocks });
  }

  return {
    id: response.id,
    nombre: input.nombre,
    estado: 'Nueva',
    viabilidadTecnica: input.viabilidadTecnica,
    tiempoEstimado: input.tiempoEstimado,
    stackSugerido: input.stackSugerido,
    iteracion: 1,
    fechaCreacion: now,
    contenido: input.contenido,
  };
}

/**
 * Updates an idea's status and/or properties
 */
export async function updateIdeaStatus(input: IdeaUpdateInput): Promise<void> {
  const properties: Record<string, unknown> = {};

  if (input.estado) {
    properties['Estado'] = selectProperty(input.estado);
  }

  if (input.viabilidadTecnica) {
    properties['Viabilidad Técnica'] = selectProperty(input.viabilidadTecnica);
  }

  if (input.tiempoEstimado) {
    properties['Tiempo Estimado'] = selectProperty(input.tiempoEstimado);
  }

  if (input.stackSugerido) {
    properties['Stack Sugerido'] = multiSelectProperty(input.stackSugerido);
  }

  if (input.iteracion !== undefined) {
    properties['Iteración'] = numberProperty(input.iteracion);
  }

  if (Object.keys(properties).length > 0) {
    await updateDatabaseEntry({
      pageId: input.ideaId,
      properties: properties as Record<string, Parameters<typeof updateDatabaseEntry>[0]['properties'][string]>,
    });
  }
}

/**
 * Gets the full content of an idea (including page body)
 */
export async function getIdeaContent(ideaId: string): Promise<string> {
  const blocks = await readAllBlocks(ideaId);
  return blocksToMarkdown(blocks);
}

// ============================================
// Prototype Operations
// ============================================

/**
 * Writes or updates a prototype document for an idea
 * Increments the iteration counter
 */
export async function writePrototype(
  ideaId: string,
  prototypeContent: string
): Promise<number> {
  // Get current idea to get iteration count
  const idea = await getIdea(ideaId);
  if (!idea) {
    throw new Error(`Idea not found: ${ideaId}`);
  }

  const newIteration = idea.iteracion + 1;

  // Update iteration counter and status
  await updateIdeaStatus({
    ideaId,
    iteracion: newIteration,
    estado: 'En Evaluación',
  });

  // Replace page content with new prototype
  const header = `# Prototipo v${newIteration}\n\n`;
  const blocks = markdownToBlocks(header + prototypeContent);
  await replaceBlocks(ideaId, blocks);

  return newIteration;
}

/**
 * Appends to existing prototype content (for incremental updates)
 */
export async function appendToPrototype(
  ideaId: string,
  additionalContent: string
): Promise<void> {
  const blocks = markdownToBlocks(additionalContent);
  await appendBlocks({ parentId: ideaId, blocks });
}

// ============================================
// Evaluation Operations
// ============================================

/**
 * Adds an evaluation comment to an idea
 */
export async function addEvaluationComment(
  ideaId: string,
  comment: string
): Promise<void> {
  await addComment({
    pageId: ideaId,
    content: comment,
  });
}

/**
 * Gets all evaluation comments for an idea
 */
export async function getEvaluationComments(ideaId: string): Promise<string[]> {
  const comments = await listAllComments(ideaId);
  return comments.map(getCommentText);
}

/**
 * Approves an idea (sets status to "Aprobada")
 */
export async function approveIdea(ideaId: string, comment?: string): Promise<void> {
  await updateIdeaStatus({
    ideaId,
    estado: 'Aprobada',
  });

  if (comment) {
    await addEvaluationComment(ideaId, `✅ Aprobada: ${comment}`);
  }
}

/**
 * Rejects an idea (sets status to "Rechazada")
 */
export async function rejectIdea(ideaId: string, reason: string): Promise<void> {
  await updateIdeaStatus({
    ideaId,
    estado: 'Rechazada',
  });

  await addEvaluationComment(ideaId, `❌ Rechazada: ${reason}`);
}

/**
 * Marks an idea as in development
 */
export async function startDevelopment(ideaId: string): Promise<void> {
  await updateIdeaStatus({
    ideaId,
    estado: 'En Desarrollo',
  });
}

/**
 * Marks an idea as completed
 */
export async function completeIdea(ideaId: string, summary?: string): Promise<void> {
  await updateIdeaStatus({
    ideaId,
    estado: 'Completada',
  });

  if (summary) {
    await addEvaluationComment(ideaId, `🎉 Completada: ${summary}`);
  }
}

// ============================================
// Helpers
// ============================================

/**
 * Converts a Notion page to a SoftwareIdea
 */
function pageToSoftwareIdea(page: PageObjectResponse): SoftwareIdea {
  const props = page.properties;
  const dateVal = extractDate(props['Fecha Creación'] as Parameters<typeof extractDate>[0]);

  return {
    id: page.id,
    nombre: extractTitle(props['Nombre'] as Parameters<typeof extractTitle>[0]),
    estado: (extractSelect(props['Estado'] as Parameters<typeof extractSelect>[0]) ?? 'Nueva') as IdeaStatus,
    viabilidadTecnica: (extractSelect(props['Viabilidad Técnica'] as Parameters<typeof extractSelect>[0]) ?? 'Media') as TechnicalViability,
    tiempoEstimado: (extractSelect(props['Tiempo Estimado'] as Parameters<typeof extractSelect>[0]) ?? '2-4 semanas') as EstimatedTime,
    stackSugerido: extractMultiSelect(props['Stack Sugerido'] as Parameters<typeof extractMultiSelect>[0]) as TechStack[],
    iteracion: extractNumber(props['Iteración'] as Parameters<typeof extractNumber>[0]) ?? 1,
    fechaCreacion: dateVal?.start ?? '',
    contenido: '', // Content loaded separately via getIdeaContent
  };
}
