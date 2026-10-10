import { formatEditorContext } from '@/core/prompt/editorContext';
import type { ComposerLineRangeMention } from '@/features/chat/composer/composerLineRangeMentions';

/**
 * Appends one `<editor_selection>` block per mentioned line range. Unreadable files are
 * skipped rather than failing the turn; the mention text itself stays in the prompt.
 */
export async function resolveLineRangeMentions(
  text: string,
  mentions: readonly ComposerLineRangeMention[],
  readFile: (filePath: string) => Promise<string>,
): Promise<string> {
  if (mentions.length === 0) return text;

  const blocks: string[] = [];
  const resolved = new Set<string>();
  for (const mention of mentions) {
    const key = `${mention.filePath}#${mention.startLine}-${mention.endLine}`;
    if (resolved.has(key)) continue;
    resolved.add(key);

    let content: string;
    try {
      content = await readFile(mention.filePath);
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    const endLine = Math.min(mention.endLine, lines.length);
    if (endLine < mention.startLine) continue;
    const block = formatEditorContext({
      notePath: mention.filePath,
      mode: 'selection',
      selectedText: lines.slice(mention.startLine - 1, endLine).join('\n'),
      startLine: mention.startLine,
      lineCount: endLine - mention.startLine + 1,
    });
    if (block) blocks.push(block);
  }

  if (blocks.length === 0) return text;
  return `${text}\n\n${blocks.join('\n\n')}`;
}
