import type { ComposerLineRangeMention } from '@/features/chat/composer/composerLineRangeMentions';
import { resolveLineRangeMentions } from '@/features/chat/input/resolveLineRangeMentions';

function mention(filePath: string, startLine: number, endLine: number): ComposerLineRangeMention {
  return { index: 0, fullMatch: `@${filePath}#${startLine}-${endLine}`, filePath, startLine, endLine };
}

const read = (content: string) => () => Promise.resolve(content);

describe('resolveLineRangeMentions', () => {
  it('returns the prompt unchanged when nothing was mentioned', async () => {
    expect(await resolveLineRangeMentions('hello world', [], read(''))).toBe('hello world');
  });

  it('appends the selected lines as an editor_selection block', async () => {
    const result = await resolveLineRangeMentions(
      'check this @notes/foo.md#2-4',
      [mention('notes/foo.md', 2, 4)],
      read('line1\nline2\nline3\nline4\nline5'),
    );
    expect(result).toBe(
      'check this @notes/foo.md#2-4\n\n'
      + '<editor_selection path="notes/foo.md" lines="2-4">\n'
      + '<![CDATA[line2\nline3\nline4]]>\n'
      + '</editor_selection>',
    );
  });

  it('clamps the end line to the file length', async () => {
    const result = await resolveLineRangeMentions('prompt', [mention('x.md', 3, 99)], read('l1\nl2\nl3'));
    expect(result).toContain('<editor_selection path="x.md" lines="3-3">');
    expect(result).toContain('l3');
  });

  it('normalizes CRLF line endings', async () => {
    const result = await resolveLineRangeMentions('prompt', [mention('win.md', 2, 3)], read('line1\r\nline2\r\nline3\r\nline4'));
    expect(result).toContain('<![CDATA[line2\nline3]]>');
  });

  it('keeps the prompt when the file cannot be read', async () => {
    const result = await resolveLineRangeMentions('prompt', [mention('missing.md', 1, 2)], () => Promise.reject(new Error('nope')));
    expect(result).toBe('prompt');
  });

  it('expands a repeated mention only once', async () => {
    const result = await resolveLineRangeMentions(
      '@a.md#1-2 and @a.md#1-2',
      [mention('a.md', 1, 2), mention('a.md', 1, 2)],
      read('a1\na2\na3'),
    );
    expect(result.match(/<editor_selection /g)).toHaveLength(1);
  });

  it('appends one block per distinct range in the same file', async () => {
    const result = await resolveLineRangeMentions(
      '@a.md#1-2 @a.md#3-3',
      [mention('a.md', 1, 2), mention('a.md', 3, 3)],
      read('a1\na2\na3'),
    );
    expect(result).toContain('<editor_selection path="a.md" lines="1-2">');
    expect(result).toContain('<editor_selection path="a.md" lines="3-3">');
  });
});
