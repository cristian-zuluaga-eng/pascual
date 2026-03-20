import type { Client } from '@notionhq/client';
import type {
  PageObjectResponse,
  DatabaseObjectResponse,
  BlockObjectResponse,
  CommentObjectResponse,
  QueryDatabaseResponse,
  CreatePageResponse,
  UpdatePageResponse,
  AppendBlockChildrenResponse,
  ListBlockChildrenResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

// Re-export useful Notion types
export type {
  PageObjectResponse,
  DatabaseObjectResponse,
  BlockObjectResponse,
  CommentObjectResponse,
  QueryDatabaseResponse,
  CreatePageResponse,
  UpdatePageResponse,
  AppendBlockChildrenResponse,
  ListBlockChildrenResponse,
  RichTextItemResponse,
};

// Client type
export type NotionClient = Client;

// ============================================
// Core Tool Types
// ============================================

export interface NotionError extends Error {
  tool: string;
  params: Record<string, unknown>;
  originalError: unknown;
}

export interface PageCreateParams {
  parentPageId?: string;
  parentDatabaseId?: string;
  title: string;
  properties?: Record<string, PropertyValue>;
  content?: NotionBlock[];
}

export interface PageUpdateParams {
  pageId: string;
  properties?: Record<string, PropertyValue>;
  archived?: boolean;
}

export interface DatabaseQueryParams {
  databaseId: string;
  filter?: DatabaseFilter;
  sorts?: DatabaseSort[];
  pageSize?: number;
  startCursor?: string;
}

export interface DatabaseEntryParams {
  databaseId: string;
  properties: Record<string, PropertyValue>;
  content?: NotionBlock[];
}

export interface BlockAppendParams {
  parentId: string;
  blocks: NotionBlock[];
}

export interface CommentParams {
  pageId: string;
  content: string;
}

// ============================================
// Property Types
// ============================================

export type PropertyValue =
  | TitleProperty
  | RichTextProperty
  | NumberProperty
  | SelectProperty
  | MultiSelectProperty
  | DateProperty
  | CheckboxProperty
  | UrlProperty
  | EmailProperty
  | PhoneProperty;

export interface TitleProperty {
  type: 'title';
  title: RichTextItem[];
}

export interface RichTextProperty {
  type: 'rich_text';
  rich_text: RichTextItem[];
}

export interface NumberProperty {
  type: 'number';
  number: number | null;
}

export interface SelectProperty {
  type: 'select';
  select: { name: string } | null;
}

export interface MultiSelectProperty {
  type: 'multi_select';
  multi_select: { name: string }[];
}

export interface DateProperty {
  type: 'date';
  date: {
    start: string;
    end?: string | null;
    time_zone?: string | null;
  } | null;
}

export interface CheckboxProperty {
  type: 'checkbox';
  checkbox: boolean;
}

export interface UrlProperty {
  type: 'url';
  url: string | null;
}

export interface EmailProperty {
  type: 'email';
  email: string | null;
}

export interface PhoneProperty {
  type: 'phone_number';
  phone_number: string | null;
}

// ============================================
// Rich Text Types
// ============================================

export interface RichTextItem {
  type: 'text';
  text: {
    content: string;
    link?: { url: string } | null;
  };
  annotations?: TextAnnotations;
}

export interface TextAnnotations {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: TextColor;
}

export type TextColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'green_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background';

// ============================================
// Block Types
// ============================================

export type NotionBlock =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | ToDoBlock
  | ToggleBlock
  | CodeBlock
  | QuoteBlock
  | DividerBlock
  | CalloutBlock
  | TableBlock;

export interface ParagraphBlock {
  type: 'paragraph';
  paragraph: {
    rich_text: RichTextItem[];
  };
}

export interface Heading1Block {
  type: 'heading_1';
  heading_1: {
    rich_text: RichTextItem[];
  };
}

export interface Heading2Block {
  type: 'heading_2';
  heading_2: {
    rich_text: RichTextItem[];
  };
}

export interface Heading3Block {
  type: 'heading_3';
  heading_3: {
    rich_text: RichTextItem[];
  };
}

export interface BulletedListItemBlock {
  type: 'bulleted_list_item';
  bulleted_list_item: {
    rich_text: RichTextItem[];
  };
}

export interface NumberedListItemBlock {
  type: 'numbered_list_item';
  numbered_list_item: {
    rich_text: RichTextItem[];
  };
}

export interface ToDoBlock {
  type: 'to_do';
  to_do: {
    rich_text: RichTextItem[];
    checked: boolean;
  };
}

export interface ToggleBlock {
  type: 'toggle';
  toggle: {
    rich_text: RichTextItem[];
  };
}

export interface CodeBlock {
  type: 'code';
  code: {
    rich_text: RichTextItem[];
    language: CodeLanguage;
  };
}

export type CodeLanguage =
  | 'abap'
  | 'arduino'
  | 'bash'
  | 'basic'
  | 'c'
  | 'clojure'
  | 'coffeescript'
  | 'c++'
  | 'c#'
  | 'css'
  | 'dart'
  | 'diff'
  | 'docker'
  | 'elixir'
  | 'elm'
  | 'erlang'
  | 'flow'
  | 'fortran'
  | 'f#'
  | 'gherkin'
  | 'glsl'
  | 'go'
  | 'graphql'
  | 'groovy'
  | 'haskell'
  | 'html'
  | 'java'
  | 'javascript'
  | 'json'
  | 'julia'
  | 'kotlin'
  | 'latex'
  | 'less'
  | 'lisp'
  | 'livescript'
  | 'lua'
  | 'makefile'
  | 'markdown'
  | 'markup'
  | 'matlab'
  | 'mermaid'
  | 'nix'
  | 'objective-c'
  | 'ocaml'
  | 'pascal'
  | 'perl'
  | 'php'
  | 'plain text'
  | 'powershell'
  | 'prolog'
  | 'protobuf'
  | 'python'
  | 'r'
  | 'reason'
  | 'ruby'
  | 'rust'
  | 'sass'
  | 'scala'
  | 'scheme'
  | 'scss'
  | 'shell'
  | 'sql'
  | 'swift'
  | 'typescript'
  | 'vb.net'
  | 'verilog'
  | 'vhdl'
  | 'visual basic'
  | 'webassembly'
  | 'xml'
  | 'yaml'
  | 'java/c/c++/c#';

export interface QuoteBlock {
  type: 'quote';
  quote: {
    rich_text: RichTextItem[];
  };
}

export interface DividerBlock {
  type: 'divider';
  divider: Record<string, never>;
}

export interface CalloutBlock {
  type: 'callout';
  callout: {
    rich_text: RichTextItem[];
    icon?: { emoji: string } | { external: { url: string } };
  };
}

export interface TableBlock {
  type: 'table';
  table: {
    table_width: number;
    has_column_header: boolean;
    has_row_header: boolean;
    children: TableRowBlock[];
  };
}

export interface TableRowBlock {
  type: 'table_row';
  table_row: {
    cells: RichTextItem[][];
  };
}

// ============================================
// Filter & Sort Types
// ============================================

export type DatabaseFilter =
  | PropertyFilter
  | CompoundFilter;

export interface PropertyFilter {
  property: string;
  [key: string]: unknown;
}

export interface CompoundFilter {
  or?: DatabaseFilter[];
  and?: DatabaseFilter[];
}

export interface DatabaseSort {
  property?: string;
  timestamp?: 'created_time' | 'last_edited_time';
  direction: 'ascending' | 'descending';
}

// ============================================
// Module-Specific Types: CONDOR
// ============================================

export type Sector =
  | 'Tecnología'
  | 'Finanzas'
  | 'Energía'
  | 'Salud'
  | 'Consumo'
  | 'Industrial'
  | 'Materiales'
  | 'Utilidades'
  | 'Inmobiliario'
  | 'Comunicaciones';

export type RiskProfile = 'Conservador' | 'Moderado' | 'Agresivo';

export type AlertLevel = 'Verde' | 'Amarillo' | 'Naranja' | 'Rojo';

export type ConfidenceLevel = 'Alta' | 'Media' | 'Baja';

export interface PortfolioAsset {
  id: string;
  nombre: string;
  ticker: string;
  sector: Sector;
  cantidad: number;
  precioCompra: number;
  pesoObjetivo: number;
  perfilRiesgo: RiskProfile;
  notas: string;
}

export interface CondorReport {
  id?: string;
  titulo: string;
  fecha: string;
  nivelAlerta: AlertLevel;
  activosAfectados: string[];
  oportunidades: number;
  confianza: ConfidenceLevel;
  contenido: string;
}

export interface CondorReportInput {
  nivelAlerta: AlertLevel;
  activosAfectados: string[];
  oportunidades: number;
  confianza: ConfidenceLevel;
  contenido: string;
}

// ============================================
// Module-Specific Types: IDEAS
// ============================================

export type IdeaStatus =
  | 'Nueva'
  | 'En Evaluación'
  | 'Aprobada'
  | 'Rechazada'
  | 'En Desarrollo'
  | 'Completada';

export type TechnicalViability = 'Alta' | 'Media' | 'Baja';

export type EstimatedTime = '1 semana' | '2-4 semanas' | '1-3 meses' | '3+ meses';

export type TechStack =
  | 'React'
  | 'Node'
  | 'Python'
  | 'Go'
  | 'TypeScript'
  | 'Rust'
  | 'PostgreSQL'
  | 'MongoDB'
  | 'Redis'
  | 'Docker'
  | 'AWS'
  | 'GCP'
  | 'Kubernetes';

export interface SoftwareIdea {
  id: string;
  nombre: string;
  estado: IdeaStatus;
  viabilidadTecnica: TechnicalViability;
  tiempoEstimado: EstimatedTime;
  stackSugerido: TechStack[];
  iteracion: number;
  fechaCreacion: string;
  contenido: string;
}

export interface IdeaCreateInput {
  nombre: string;
  viabilidadTecnica: TechnicalViability;
  tiempoEstimado: EstimatedTime;
  stackSugerido: TechStack[];
  contenido: string;
}

export interface IdeaUpdateInput {
  ideaId: string;
  estado?: IdeaStatus;
  viabilidadTecnica?: TechnicalViability;
  tiempoEstimado?: EstimatedTime;
  stackSugerido?: TechStack[];
  iteracion?: number;
}

// ============================================
// Module-Specific Types: SPORTS
// ============================================

export type Sport = 'Fútbol' | 'Baloncesto' | 'Tenis' | 'Béisbol' | 'Hockey' | 'MMA' | 'Boxeo' | 'eSports';

export type MatchStatus = 'Pendiente' | 'Analizado' | 'Resultado Conocido';

export type BetResult = 'Ganada' | 'Perdida' | 'Void' | 'Pendiente';

export interface SportsMatch {
  id: string;
  partido: string;
  fecha: string;
  estado: MatchStatus;
  deporte: Sport;
  apuestaRecomendada: string;
  confianza: number;
  evEsperado: number;
  resultadoReal: BetResult;
  contenido: string;
}

export interface MatchAnalysisInput {
  matchId: string;
  apuestaRecomendada: string;
  confianza: number;
  evEsperado: number;
  analisis: string;
}

export interface MatchResultInput {
  matchId: string;
  resultado: BetResult;
}

export interface BacktestingFilters {
  deporte?: Sport;
  fechaInicio?: string;
  fechaFin?: string;
  confianzaMinima?: number;
}

export interface BacktestingResult {
  totalApuestas: number;
  ganadas: number;
  perdidas: number;
  voids: number;
  pendientes: number;
  roi: number;
  evPromedio: number;
  matches: SportsMatch[];
}
