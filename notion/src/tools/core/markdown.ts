import type {
  NotionBlock,
  RichTextItem,
  CodeLanguage,
  BlockObjectResponse,
} from '../../types.js';
import {
  text,
  bold,
  italic,
  code,
  link,
  styledText,
  paragraph,
  textHeading1,
  textHeading2,
  textHeading3,
  bulletedListItem,
  numberedListItem,
  codeBlock,
  textQuote,
  divider,
  textTable,
} from '../../utils/notion-blocks.js';

// ============================================
// Markdown to Notion Blocks
// ============================================

interface ParserState {
  lines: string[];
  index: number;
}

/**
 * Converts markdown text to Notion blocks
 * Supports: h1-h3, bold, italic, code, codeblock, lists, tables, dividers, quotes, links
 */
export function markdownToBlocks(markdown: string): NotionBlock[] {
  const lines = markdown.split('\n');
  const state: ParserState = { lines, index: 0 };
  const blocks: NotionBlock[] = [];

  while (state.index < state.lines.length) {
    const line = state.lines[state.index] ?? '';

    // Skip empty lines
    if (line.trim() === '') {
      state.index++;
      continue;
    }

    // Try each parser in order
    const block =
      parseHeading(line) ??
      parseDivider(line) ??
      parseCodeBlock(state) ??
      parseQuote(line) ??
      parseTable(state) ??
      parseBulletedList(line) ??
      parseNumberedList(line) ??
      parseParagraph(line);

    if (block) {
      blocks.push(block);
    }

    state.index++;
  }

  return blocks;
}

/**
 * Parses headings (# ## ###)
 */
function parseHeading(line: string): NotionBlock | null {
  const h3Match = line.match(/^###\s+(.+)$/);
  if (h3Match?.[1]) return textHeading3(h3Match[1]);

  const h2Match = line.match(/^##\s+(.+)$/);
  if (h2Match?.[1]) return textHeading2(h2Match[1]);

  const h1Match = line.match(/^#\s+(.+)$/);
  if (h1Match?.[1]) return textHeading1(h1Match[1]);

  return null;
}

/**
 * Parses dividers (--- or ***)
 */
function parseDivider(line: string): NotionBlock | null {
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
    return divider();
  }
  return null;
}

/**
 * Parses fenced code blocks (```language ... ```)
 */
function parseCodeBlock(state: ParserState): NotionBlock | null {
  const line = state.lines[state.index] ?? '';
  const startMatch = line.match(/^```(\w*)$/);

  if (!startMatch) return null;

  const language = mapLanguage(startMatch[1] ?? '');
  const codeLines: string[] = [];

  state.index++;

  while (state.index < state.lines.length) {
    const currentLine = state.lines[state.index] ?? '';
    if (currentLine.trim() === '```') {
      break;
    }
    codeLines.push(currentLine);
    state.index++;
  }

  return codeBlock(codeLines.join('\n'), language);
}

/**
 * Maps common language aliases to Notion's supported languages
 */
function mapLanguage(lang: string): CodeLanguage {
  const langMap: Record<string, CodeLanguage> = {
    '': 'plain text',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'shell': 'bash',
    'yml': 'yaml',
    'dockerfile': 'docker',
    'cpp': 'c++',
    'csharp': 'c#',
    'cs': 'c#',
    'objc': 'objective-c',
    'golang': 'go',
  };

  const normalized = lang.toLowerCase();
  return langMap[normalized] ?? (normalized as CodeLanguage) ?? 'plain text';
}

/**
 * Parses blockquotes (> text)
 */
function parseQuote(line: string): NotionBlock | null {
  const match = line.match(/^>\s*(.*)$/);
  if (match) {
    return textQuote(match[1] ?? '');
  }
  return null;
}

/**
 * Parses tables
 */
function parseTable(state: ParserState): NotionBlock | null {
  const line = state.lines[state.index] ?? '';

  // Check if this is a table row (starts with |)
  if (!line.trim().startsWith('|')) return null;

  const rows: string[][] = [];
  let foundSeparator = false;

  while (state.index < state.lines.length) {
    const currentLine = state.lines[state.index] ?? '';

    if (!currentLine.trim().startsWith('|')) {
      state.index--;
      break;
    }

    // Check if this is a separator row (|---|---|)
    if (/^\|[\s-:|]+\|$/.test(currentLine.trim())) {
      foundSeparator = true;
      state.index++;
      continue;
    }

    // Parse table cells
    const cells = currentLine
      .split('|')
      .slice(1, -1) // Remove first and last empty elements
      .map(cell => cell.trim());

    if (cells.length > 0) {
      rows.push(cells);
    }

    state.index++;
  }

  if (rows.length === 0) return null;

  // Only treat as table if we found a separator (proper markdown table)
  if (!foundSeparator && rows.length === 1) {
    state.index -= rows.length;
    return null;
  }

  return textTable(rows, true, false);
}

/**
 * Parses bulleted list items (- or * or +)
 */
function parseBulletedList(line: string): NotionBlock | null {
  const match = line.match(/^[-*+]\s+(.+)$/);
  if (match?.[1]) {
    return bulletedListItem(parseInlineFormatting(match[1]));
  }
  return null;
}

/**
 * Parses numbered list items (1. 2. etc)
 */
function parseNumberedList(line: string): NotionBlock | null {
  const match = line.match(/^\d+\.\s+(.+)$/);
  if (match?.[1]) {
    return numberedListItem(parseInlineFormatting(match[1]));
  }
  return null;
}

/**
 * Parses regular paragraphs
 */
function parseParagraph(line: string): NotionBlock {
  return paragraph(parseInlineFormatting(line));
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, [link](url)
 */
function parseInlineFormatting(text_content: string): RichTextItem[] {
  const items: RichTextItem[] = [];
  let remaining = text_content;

  // Regex patterns for inline formatting
  const patterns = [
    // Bold + Italic (***text***)
    { regex: /\*\*\*(.+?)\*\*\*/, handler: (match: string) => styledText(match, { bold: true, italic: true }) },
    // Bold (**text**)
    { regex: /\*\*(.+?)\*\*/, handler: (match: string) => bold(match) },
    // Italic (*text* or _text_)
    { regex: /(?<!\*)\*([^*]+?)\*(?!\*)/, handler: (match: string) => italic(match) },
    { regex: /_(.+?)_/, handler: (match: string) => italic(match) },
    // Code (`text`)
    { regex: /`([^`]+?)`/, handler: (match: string) => code(match) },
    // Link [text](url)
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, handler: (_: string, url: string) => link(_, url) },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; item: RichTextItem } | null = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined) {
        const item = pattern.handler(match[1] ?? '', match[2] ?? '');
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = {
            index: match.index,
            length: match[0].length,
            item,
          };
        }
      }
    }

    if (earliestMatch) {
      // Add text before the match
      if (earliestMatch.index > 0) {
        items.push(text(remaining.slice(0, earliestMatch.index)));
      }
      items.push(earliestMatch.item);
      remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
    } else {
      // No more matches, add remaining text
      items.push(text(remaining));
      break;
    }
  }

  return items.length > 0 ? items : [text('')];
}

// ============================================
// Notion Blocks to Markdown
// ============================================

type SupportedBlockType =
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'bulleted_list_item'
  | 'numbered_list_item'
  | 'to_do'
  | 'code'
  | 'quote'
  | 'divider'
  | 'callout'
  | 'table';

interface RichTextContent {
  rich_text: Array<{
    plain_text: string;
    annotations?: {
      bold?: boolean;
      italic?: boolean;
      code?: boolean;
      strikethrough?: boolean;
    };
    href?: string | null;
  }>;
}

interface CodeContent extends RichTextContent {
  language?: string;
}

interface ToDoContent extends RichTextContent {
  checked?: boolean;
}

interface TableContent {
  table_width?: number;
  has_column_header?: boolean;
}

type BlockContent = RichTextContent | CodeContent | ToDoContent | TableContent | Record<string, never>;

type BlockWithChildren = BlockObjectResponse & {
  children?: BlockObjectResponse[];
};

/**
 * Converts Notion blocks to markdown text
 */
export function blocksToMarkdown(blocks: BlockObjectResponse[]): string {
  const lines: string[] = [];
  let numberedListCounter = 0;

  for (const block of blocks) {
    const blockType = block.type as SupportedBlockType;
    const content = block[blockType as keyof typeof block] as BlockContent | undefined;

    switch (blockType) {
      case 'paragraph':
        numberedListCounter = 0;
        lines.push(richTextToMarkdown((content as RichTextContent)?.rich_text ?? []));
        break;

      case 'heading_1':
        numberedListCounter = 0;
        lines.push(`# ${richTextToMarkdown((content as RichTextContent)?.rich_text ?? [])}`);
        break;

      case 'heading_2':
        numberedListCounter = 0;
        lines.push(`## ${richTextToMarkdown((content as RichTextContent)?.rich_text ?? [])}`);
        break;

      case 'heading_3':
        numberedListCounter = 0;
        lines.push(`### ${richTextToMarkdown((content as RichTextContent)?.rich_text ?? [])}`);
        break;

      case 'bulleted_list_item':
        numberedListCounter = 0;
        lines.push(`- ${richTextToMarkdown((content as RichTextContent)?.rich_text ?? [])}`);
        break;

      case 'numbered_list_item':
        numberedListCounter++;
        lines.push(`${numberedListCounter}. ${richTextToMarkdown((content as RichTextContent)?.rich_text ?? [])}`);
        break;

      case 'to_do': {
        numberedListCounter = 0;
        const todoContent = content as ToDoContent;
        const checkbox = todoContent?.checked ? '[x]' : '[ ]';
        lines.push(`- ${checkbox} ${richTextToMarkdown(todoContent?.rich_text ?? [])}`);
        break;
      }

      case 'code': {
        numberedListCounter = 0;
        const codeContent = content as CodeContent;
        const lang = codeContent?.language ?? '';
        const codeText = richTextToMarkdown(codeContent?.rich_text ?? []);
        lines.push(`\`\`\`${lang}\n${codeText}\n\`\`\``);
        break;
      }

      case 'quote':
        numberedListCounter = 0;
        lines.push(`> ${richTextToMarkdown((content as RichTextContent)?.rich_text ?? [])}`);
        break;

      case 'divider':
        numberedListCounter = 0;
        lines.push('---');
        break;

      case 'callout':
        numberedListCounter = 0;
        lines.push(`> ${richTextToMarkdown((content as RichTextContent)?.rich_text ?? [])}`);
        break;

      case 'table': {
        numberedListCounter = 0;
        const tableBlock = block as BlockWithChildren;
        const tableLines = tableToMarkdown(tableBlock.children ?? [], (content as TableContent)?.has_column_header ?? false);
        lines.push(tableLines);
        break;
      }

      default:
        // Unsupported block type, skip
        break;
    }

    lines.push('');
  }

  return lines.join('\n').trim();
}

/**
 * Converts rich text array to markdown string
 */
function richTextToMarkdown(
  richText: Array<{
    plain_text: string;
    annotations?: {
      bold?: boolean;
      italic?: boolean;
      code?: boolean;
      strikethrough?: boolean;
    };
    href?: string | null;
  }>
): string {
  return richText
    .map(item => {
      let text_val = item.plain_text;
      const annotations = item.annotations;

      if (annotations?.code) {
        text_val = `\`${text_val}\``;
      }
      if (annotations?.bold) {
        text_val = `**${text_val}**`;
      }
      if (annotations?.italic) {
        text_val = `*${text_val}*`;
      }
      if (annotations?.strikethrough) {
        text_val = `~~${text_val}~~`;
      }
      if (item.href) {
        text_val = `[${text_val}](${item.href})`;
      }

      return text_val;
    })
    .join('');
}

/**
 * Converts table children blocks to markdown
 */
function tableToMarkdown(rows: BlockObjectResponse[], hasHeader: boolean): string {
  if (rows.length === 0) return '';

  const lines: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row?.type !== 'table_row') continue;

    const tableRow = row['table_row'] as { cells: Array<Array<{ plain_text: string }>> };
    const cells = tableRow.cells.map(cell =>
      cell.map(rt => rt.plain_text).join('')
    );

    lines.push(`| ${cells.join(' | ')} |`);

    // Add separator after header row
    if (hasHeader && i === 0) {
      lines.push(`| ${cells.map(() => '---').join(' | ')} |`);
    }
  }

  return lines.join('\n');
}
