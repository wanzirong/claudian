import type { ComposerInputElement } from '@/shared/composer-dropdown/types';

/**
 * Appends text at the end of the composer, leaves the caret after it, and notifies the
 * editor so its draft and dropdown state follow the change.
 */
export function appendToComposer(inputEl: ComposerInputElement, insertion: string): void {
  const currentValue = inputEl.value;
  if (inputEl.replaceText) inputEl.replaceText(currentValue.length, currentValue.length, insertion);
  else inputEl.value = `${currentValue}${insertion}`;

  const cursorPosition = inputEl.value.length;
  inputEl.selectionStart = cursorPosition;
  inputEl.selectionEnd = cursorPosition;

  const EventConstructor = inputEl.ownerDocument.defaultView?.Event ?? Event;
  inputEl.dispatchEvent(new EventConstructor('input', { bubbles: true }));
  inputEl.focus();
}
