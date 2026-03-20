import { describe, it, expect } from 'vitest';
import { markdownToBlocks, blocksToMarkdown } from '../../src/tools/core/markdown.js';
import type { BlockObjectResponse } from '../../src/types.js';

describe('markdownToBlocks', () => {
  describe('headings', () => {
    it('converts h1 headings', () => {
      const blocks = markdownToBlocks('# Hello World');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: 'Hello World' } }],
        },
      });
    });

    it('converts h2 headings', () => {
      const blocks = markdownToBlocks('## Subtitle');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Subtitle' } }],
        },
      });
    });

    it('converts h3 headings', () => {
      const blocks = markdownToBlocks('### Section');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: 'Section' } }],
        },
      });
    });
  });

  describe('inline formatting', () => {
    it('converts bold text', () => {
      const blocks = markdownToBlocks('This is **bold** text');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.type).toBe('paragraph');

      const paragraph = blocks[0] as { paragraph: { rich_text: unknown[] } };
      expect(paragraph.paragraph.rich_text).toHaveLength(3);
      expect(paragraph.paragraph.rich_text[1]).toMatchObject({
        type: 'text',
        text: { content: 'bold' },
        annotations: { bold: true },
      });
    });

    it('converts italic text', () => {
      const blocks = markdownToBlocks('This is *italic* text');
      expect(blocks).toHaveLength(1);

      const paragraph = blocks[0] as { paragraph: { rich_text: unknown[] } };
      expect(paragraph.paragraph.rich_text[1]).toMatchObject({
        type: 'text',
        text: { content: 'italic' },
        annotations: { italic: true },
      });
    });

    it('converts inline code', () => {
      const blocks = markdownToBlocks('Use `const` keyword');
      expect(blocks).toHaveLength(1);

      const paragraph = blocks[0] as { paragraph: { rich_text: unknown[] } };
      expect(paragraph.paragraph.rich_text[1]).toMatchObject({
        type: 'text',
        text: { content: 'const' },
        annotations: { code: true },
      });
    });

    it('converts links', () => {
      const blocks = markdownToBlocks('Visit [Google](https://google.com)');
      expect(blocks).toHaveLength(1);

      const paragraph = blocks[0] as { paragraph: { rich_text: unknown[] } };
      expect(paragraph.paragraph.rich_text[1]).toMatchObject({
        type: 'text',
        text: { content: 'Google', link: { url: 'https://google.com' } },
      });
    });

    it('converts bold + italic combined', () => {
      const blocks = markdownToBlocks('This is ***bold and italic***');
      expect(blocks).toHaveLength(1);

      const paragraph = blocks[0] as { paragraph: { rich_text: unknown[] } };
      expect(paragraph.paragraph.rich_text[1]).toMatchObject({
        type: 'text',
        text: { content: 'bold and italic' },
        annotations: { bold: true, italic: true },
      });
    });
  });

  describe('lists', () => {
    it('converts bulleted lists with dash', () => {
      const blocks = markdownToBlocks('- Item 1\n- Item 2\n- Item 3');
      expect(blocks).toHaveLength(3);
      blocks.forEach((block, i) => {
        expect(block).toMatchObject({
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: `Item ${i + 1}` } }],
          },
        });
      });
    });

    it('converts bulleted lists with asterisk', () => {
      const blocks = markdownToBlocks('* Item A\n* Item B');
      expect(blocks).toHaveLength(2);
      expect(blocks[0]?.type).toBe('bulleted_list_item');
    });

    it('converts numbered lists', () => {
      const blocks = markdownToBlocks('1. First\n2. Second\n3. Third');
      expect(blocks).toHaveLength(3);
      blocks.forEach(block => {
        expect(block.type).toBe('numbered_list_item');
      });
    });
  });

  describe('code blocks', () => {
    it('converts fenced code blocks', () => {
      const blocks = markdownToBlocks('```javascript\nconst x = 1;\nconsole.log(x);\n```');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({
        type: 'code',
        code: {
          language: 'javascript',
          rich_text: [{ type: 'text', text: { content: 'const x = 1;\nconsole.log(x);' } }],
        },
      });
    });

    it('uses plain text for unknown languages', () => {
      const blocks = markdownToBlocks('```\nsome code\n```');
      expect(blocks).toHaveLength(1);

      const codeBlock = blocks[0] as { code: { language: string } };
      expect(codeBlock.code.language).toBe('plain text');
    });

    it('maps language aliases correctly', () => {
      const jsBlocks = markdownToBlocks('```js\ncode\n```');
      expect((jsBlocks[0] as { code: { language: string } }).code.language).toBe('javascript');

      const tsBlocks = markdownToBlocks('```ts\ncode\n```');
      expect((tsBlocks[0] as { code: { language: string } }).code.language).toBe('typescript');

      const pyBlocks = markdownToBlocks('```py\ncode\n```');
      expect((pyBlocks[0] as { code: { language: string } }).code.language).toBe('python');
    });
  });

  describe('quotes', () => {
    it('converts blockquotes', () => {
      const blocks = markdownToBlocks('> This is a quote');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({
        type: 'quote',
        quote: {
          rich_text: [{ type: 'text', text: { content: 'This is a quote' } }],
        },
      });
    });
  });

  describe('dividers', () => {
    it('converts horizontal rules with dashes', () => {
      const blocks = markdownToBlocks('---');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({
        type: 'divider',
        divider: {},
      });
    });

    it('converts horizontal rules with asterisks', () => {
      const blocks = markdownToBlocks('***');
      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.type).toBe('divider');
    });
  });

  describe('tables', () => {
    it('converts markdown tables', () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;

      const blocks = markdownToBlocks(markdown);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]?.type).toBe('table');

      const tableBlock = blocks[0] as { table: { table_width: number; has_column_header: boolean; children: unknown[] } };
      expect(tableBlock.table.table_width).toBe(2);
      expect(tableBlock.table.has_column_header).toBe(true);
      expect(tableBlock.table.children).toHaveLength(3);
    });
  });

  describe('complex documents', () => {
    it('handles mixed content', () => {
      const markdown = `# Title

This is a paragraph with **bold** and *italic* text.

## Subtitle

- Item 1
- Item 2

\`\`\`javascript
const x = 1;
\`\`\`

> A quote

---

Done.`;

      const blocks = markdownToBlocks(markdown);
      expect(blocks.length).toBeGreaterThan(5);
      expect(blocks[0]?.type).toBe('heading_1');
      expect(blocks.some(b => b.type === 'bulleted_list_item')).toBe(true);
      expect(blocks.some(b => b.type === 'code')).toBe(true);
      expect(blocks.some(b => b.type === 'quote')).toBe(true);
      expect(blocks.some(b => b.type === 'divider')).toBe(true);
    });
  });
});

describe('blocksToMarkdown', () => {
  it('converts heading blocks to markdown', () => {
    const blocks: BlockObjectResponse[] = [
      {
        object: 'block',
        id: '1',
        type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: 'Title' }, plain_text: 'Title', annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null }], is_toggleable: false, color: 'default' },
        created_time: '',
        last_edited_time: '',
        created_by: { object: 'user', id: '' },
        last_edited_by: { object: 'user', id: '' },
        has_children: false,
        archived: false,
        in_trash: false,
        parent: { type: 'page_id', page_id: '' },
      } as BlockObjectResponse,
    ];

    const markdown = blocksToMarkdown(blocks);
    expect(markdown).toBe('# Title');
  });

  it('converts paragraph with formatting', () => {
    const blocks: BlockObjectResponse[] = [
      {
        object: 'block',
        id: '1',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: 'Normal ' }, plain_text: 'Normal ', annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null },
            { type: 'text', text: { content: 'bold' }, plain_text: 'bold', annotations: { bold: true, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null },
            { type: 'text', text: { content: ' text' }, plain_text: ' text', annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null },
          ],
          color: 'default',
        },
        created_time: '',
        last_edited_time: '',
        created_by: { object: 'user', id: '' },
        last_edited_by: { object: 'user', id: '' },
        has_children: false,
        archived: false,
        in_trash: false,
        parent: { type: 'page_id', page_id: '' },
      } as BlockObjectResponse,
    ];

    const markdown = blocksToMarkdown(blocks);
    expect(markdown).toBe('Normal **bold** text');
  });

  it('converts code blocks', () => {
    const blocks: BlockObjectResponse[] = [
      {
        object: 'block',
        id: '1',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: 'const x = 1;' }, plain_text: 'const x = 1;', annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null }],
          language: 'javascript',
          caption: [],
        },
        created_time: '',
        last_edited_time: '',
        created_by: { object: 'user', id: '' },
        last_edited_by: { object: 'user', id: '' },
        has_children: false,
        archived: false,
        in_trash: false,
        parent: { type: 'page_id', page_id: '' },
      } as BlockObjectResponse,
    ];

    const markdown = blocksToMarkdown(blocks);
    expect(markdown).toBe('```javascript\nconst x = 1;\n```');
  });

  it('converts bulleted lists', () => {
    const blocks: BlockObjectResponse[] = [
      {
        object: 'block',
        id: '1',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Item 1' }, plain_text: 'Item 1', annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null }], color: 'default' },
        created_time: '',
        last_edited_time: '',
        created_by: { object: 'user', id: '' },
        last_edited_by: { object: 'user', id: '' },
        has_children: false,
        archived: false,
        in_trash: false,
        parent: { type: 'page_id', page_id: '' },
      } as BlockObjectResponse,
      {
        object: 'block',
        id: '2',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: 'Item 2' }, plain_text: 'Item 2', annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null }], color: 'default' },
        created_time: '',
        last_edited_time: '',
        created_by: { object: 'user', id: '' },
        last_edited_by: { object: 'user', id: '' },
        has_children: false,
        archived: false,
        in_trash: false,
        parent: { type: 'page_id', page_id: '' },
      } as BlockObjectResponse,
    ];

    const markdown = blocksToMarkdown(blocks);
    expect(markdown).toBe('- Item 1\n\n- Item 2');
  });

  it('converts dividers', () => {
    const blocks: BlockObjectResponse[] = [
      {
        object: 'block',
        id: '1',
        type: 'divider',
        divider: {},
        created_time: '',
        last_edited_time: '',
        created_by: { object: 'user', id: '' },
        last_edited_by: { object: 'user', id: '' },
        has_children: false,
        archived: false,
        in_trash: false,
        parent: { type: 'page_id', page_id: '' },
      } as BlockObjectResponse,
    ];

    const markdown = blocksToMarkdown(blocks);
    expect(markdown).toBe('---');
  });
});
