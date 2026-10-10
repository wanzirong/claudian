import {
  findComposerLineRangeMentions,
  formatComposerLineRangeMention,
} from '@/features/chat/composer/composerLineRangeMentions';

describe('formatComposerLineRangeMention', () => {
  it('formats a single line and a range', () => {
    expect(formatComposerLineRangeMention('notes/foo.md', 12, 12)).toBe('@notes/foo.md#12 ');
    expect(formatComposerLineRangeMention('notes/foo.md', 12, 20)).toBe('@notes/foo.md#12-20 ');
  });

  it('quotes a path containing whitespace', () => {
    expect(formatComposerLineRangeMention('My notes/foo bar.md', 3, 4)).toBe('@"My notes/foo bar.md"#3-4 ');
  });
});

describe('findComposerLineRangeMentions', () => {
  it('finds a range and a single line with their token offsets', () => {
    const text = 'see @notes/foo.md#2-4 and @bar.md#7';
    expect(findComposerLineRangeMentions(text)).toEqual([
      { index: 4, fullMatch: '@notes/foo.md#2-4', filePath: 'notes/foo.md', startLine: 2, endLine: 4 },
      { index: 26, fullMatch: '@bar.md#7', filePath: 'bar.md', startLine: 7, endLine: 7 },
    ]);
  });

  it('finds the quoted form used for paths with whitespace', () => {
    expect(findComposerLineRangeMentions('@"My notes/foo bar.md"#3-4')).toEqual([
      { index: 0, fullMatch: '@"My notes/foo bar.md"#3-4', filePath: 'My notes/foo bar.md', startLine: 3, endLine: 4 },
    ]);
  });

  it('orders a reversed range and ignores mentions without a line number', () => {
    expect(findComposerLineRangeMentions('@foo.md#9-3')).toEqual([
      { index: 0, fullMatch: '@foo.md#9-3', filePath: 'foo.md', startLine: 3, endLine: 9 },
    ]);
    expect(findComposerLineRangeMentions('just @foo.md and #12 alone')).toEqual([]);
  });

  it('skips mentions inside code', () => {
    expect(findComposerLineRangeMentions('```\n@foo.md#2-4\n```')).toEqual([]);
  });
});
