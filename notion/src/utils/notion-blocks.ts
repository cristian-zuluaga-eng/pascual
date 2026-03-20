import type {
  RichTextItem,
  TextAnnotations,
  NotionBlock,
  ParagraphBlock,
  Heading1Block,
  Heading2Block,
  Heading3Block,
  BulletedListItemBlock,
  NumberedListItemBlock,
  CodeBlock,
  QuoteBlock,
  DividerBlock,
  CodeLanguage,
  ToDoBlock,
  CalloutBlock,
  TableBlock,
  TableRowBlock,
} from '../types.js';

// ============================================
// Rich Text Builders
// ============================================

/**
 * Creates a plain text rich text item
 */
export function text(content: string, link?: string): RichTextItem {
  return {
    type: 'text',
    text: {
      content,
      link: link ? { url: link } : null,
    },
  };
}

/**
 * Creates a styled text item
 */
export function styledText(
  content: string,
  annotations: TextAnnotations,
  link?: string
): RichTextItem {
  return {
    type: 'text',
    text: {
      content,
      link: link ? { url: link } : null,
    },
    annotations,
  };
}

/**
 * Creates bold text
 */
export function bold(content: string): RichTextItem {
  return styledText(content, { bold: true });
}

/**
 * Creates italic text
 */
export function italic(content: string): RichTextItem {
  return styledText(content, { italic: true });
}

/**
 * Creates code (inline) text
 */
export function code(content: string): RichTextItem {
  return styledText(content, { code: true });
}

/**
 * Creates strikethrough text
 */
export function strikethrough(content: string): RichTextItem {
  return styledText(content, { strikethrough: true });
}

/**
 * Creates a link text
 */
export function link(content: string, url: string): RichTextItem {
  return text(content, url);
}

// ============================================
// Block Builders
// ============================================

/**
 * Creates a paragraph block
 */
export function paragraph(richText: RichTextItem[]): ParagraphBlock {
  return {
    type: 'paragraph',
    paragraph: {
      rich_text: richText,
    },
  };
}

/**
 * Creates a paragraph from plain text
 */
export function textParagraph(content: string): ParagraphBlock {
  return paragraph([text(content)]);
}

/**
 * Creates a heading 1 block
 */
export function heading1(richText: RichTextItem[]): Heading1Block {
  return {
    type: 'heading_1',
    heading_1: {
      rich_text: richText,
    },
  };
}

/**
 * Creates a heading 1 from plain text
 */
export function textHeading1(content: string): Heading1Block {
  return heading1([text(content)]);
}

/**
 * Creates a heading 2 block
 */
export function heading2(richText: RichTextItem[]): Heading2Block {
  return {
    type: 'heading_2',
    heading_2: {
      rich_text: richText,
    },
  };
}

/**
 * Creates a heading 2 from plain text
 */
export function textHeading2(content: string): Heading2Block {
  return heading2([text(content)]);
}

/**
 * Creates a heading 3 block
 */
export function heading3(richText: RichTextItem[]): Heading3Block {
  return {
    type: 'heading_3',
    heading_3: {
      rich_text: richText,
    },
  };
}

/**
 * Creates a heading 3 from plain text
 */
export function textHeading3(content: string): Heading3Block {
  return heading3([text(content)]);
}

/**
 * Creates a bulleted list item block
 */
export function bulletedListItem(richText: RichTextItem[]): BulletedListItemBlock {
  return {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: richText,
    },
  };
}

/**
 * Creates a bulleted list item from plain text
 */
export function textBulletedListItem(content: string): BulletedListItemBlock {
  return bulletedListItem([text(content)]);
}

/**
 * Creates a numbered list item block
 */
export function numberedListItem(richText: RichTextItem[]): NumberedListItemBlock {
  return {
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: richText,
    },
  };
}

/**
 * Creates a numbered list item from plain text
 */
export function textNumberedListItem(content: string): NumberedListItemBlock {
  return numberedListItem([text(content)]);
}

/**
 * Creates a to-do block
 */
export function toDo(richText: RichTextItem[], checked = false): ToDoBlock {
  return {
    type: 'to_do',
    to_do: {
      rich_text: richText,
      checked,
    },
  };
}

/**
 * Creates a to-do from plain text
 */
export function textToDo(content: string, checked = false): ToDoBlock {
  return toDo([text(content)], checked);
}

/**
 * Creates a code block
 */
export function codeBlock(content: string, language: CodeLanguage = 'plain text'): CodeBlock {
  return {
    type: 'code',
    code: {
      rich_text: [text(content)],
      language,
    },
  };
}

/**
 * Creates a quote block
 */
export function quote(richText: RichTextItem[]): QuoteBlock {
  return {
    type: 'quote',
    quote: {
      rich_text: richText,
    },
  };
}

/**
 * Creates a quote from plain text
 */
export function textQuote(content: string): QuoteBlock {
  return quote([text(content)]);
}

/**
 * Creates a divider block
 */
export function divider(): DividerBlock {
  return {
    type: 'divider',
    divider: {},
  };
}

/**
 * Creates a callout block
 */
export function callout(richText: RichTextItem[], emoji?: string): CalloutBlock {
  return {
    type: 'callout',
    callout: {
      rich_text: richText,
      icon: emoji ? { emoji } : undefined,
    },
  };
}

/**
 * Creates a callout from plain text
 */
export function textCallout(content: string, emoji?: string): CalloutBlock {
  return callout([text(content)], emoji);
}

/**
 * Creates a table row block
 */
export function tableRow(cells: RichTextItem[][]): TableRowBlock {
  return {
    type: 'table_row',
    table_row: {
      cells,
    },
  };
}

/**
 * Creates a table row from plain text cells
 */
export function textTableRow(cells: string[]): TableRowBlock {
  return tableRow(cells.map(cell => [text(cell)]));
}

/**
 * Creates a table block
 */
export function table(
  rows: TableRowBlock[],
  hasColumnHeader = true,
  hasRowHeader = false
): TableBlock {
  const tableWidth = rows[0]?.table_row.cells.length ?? 0;

  return {
    type: 'table',
    table: {
      table_width: tableWidth,
      has_column_header: hasColumnHeader,
      has_row_header: hasRowHeader,
      children: rows,
    },
  };
}

/**
 * Creates a simple text table from string arrays
 */
export function textTable(
  rows: string[][],
  hasColumnHeader = true,
  hasRowHeader = false
): TableBlock {
  return table(rows.map(textTableRow), hasColumnHeader, hasRowHeader);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Extracts plain text from rich text array
 */
export function richTextToPlain(richText: RichTextItem[]): string {
  return richText.map(item => item.text.content).join('');
}

/**
 * Converts an array of NotionBlocks to a format suitable for API calls
 */
export function blocksToApiFormat(blocks: NotionBlock[]): unknown[] {
  return blocks.map(block => {
    // Handle table blocks specially - they need children flattened
    if (block.type === 'table') {
      const { children, ...tableProps } = block.table;
      return {
        type: 'table',
        table: tableProps,
        children: children.map(row => ({
          type: 'table_row',
          table_row: row.table_row,
        })),
      };
    }
    return block;
  });
}
