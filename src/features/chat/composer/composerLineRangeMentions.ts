import { filterMarkdownTextTokens } from '@/utils/markdownTextTokens';

export interface ComposerLineRangeMention {
  index: number;
  fullMatch: string;
  filePath: string;
  startLine: number;
  endLine: number;
}

const QUOTED_PATTERN = /@"([^"\r\n]+)"#(\d+)(?:-(\d+))?/g;
const PLAIN_PATTERN = /@([^\s"'#]+)#(\d+)(?:-(\d+))?/g;

/** Composer token for a line range; the path is quoted when it contains whitespace. */
export function formatComposerLineRangeMention(
  filePath: string,
  startLine: number,
  endLine: number,
): string {
  const target = /\s/.test(filePath) ? `@"${filePath}"` : `@${filePath}`;
  const range = startLine === endLine ? `#${startLine}` : `#${startLine}-${endLine}`;
  return `${target}${range} `;
}

export function findComposerLineRangeMentions(text: string): ComposerLineRangeMention[] {
  if (!text.includes('#')) return [];
  const mentions = [...collect(QUOTED_PATTERN, text), ...collect(PLAIN_PATTERN, text)]
    .sort((left, right) => left.index - right.index);
  return filterMarkdownTextTokens(text, mentions, true);
}

function collect(pattern: RegExp, text: string): ComposerLineRangeMention[] {
  return [...text.matchAll(pattern)].map(match => {
    const startLine = Number(match[2]);
    const endLine = match[3] ? Number(match[3]) : startLine;
    return {
      index: match.index,
      fullMatch: match[0],
      filePath: match[1],
      startLine: Math.min(startLine, endLine),
      endLine: Math.max(startLine, endLine),
    };
  });
}
