/** @jest-environment jsdom */

import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('Send/stop button styles', () => {
  function rules(): CSSStyleRule[] {
    const style = document.createElement('style');
    style.textContent = readFileSync(path.resolve('src/style/toolbar/send-stop-button.css'), 'utf8');
    document.head.appendChild(style);
    return Array.from(style.sheet!.cssRules)
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
  }

  afterEach(() => {
    document.head.replaceChildren();
    document.body.replaceChildren();
  });

  it('keeps the brand fill in every state where Obsidian restores native chrome', () => {
    // A native button gets Obsidian's own fill back on hover, focus and active; any rule
    // reaching the button in those states may only restate the brand surface.
    const fills = rules()
      .filter(rule => rule.selectorText.includes('.claudian-send-stop-btn')
        && /:(hover|focus|focus-visible|active)|:is\(/.test(rule.selectorText))
      .map(rule => rule.style.getPropertyValue('background').trim())
      .filter(Boolean);
    expect(fills).toEqual(['var(--claudian-brand)']);
  });

  it('takes the button chrome back from the host', () => {
    const base = rules().find(rule => rule.selectorText
      .split(',').some(selector => selector.trim() === 'button.claudian-send-stop-btn'));
    expect(base).toBeDefined();
    expect({
      appearance: base!.style.getPropertyValue('appearance'),
      backgroundImage: base!.style.getPropertyValue('background-image'),
      boxShadow: base!.style.getPropertyValue('box-shadow'),
      border: base!.style.getPropertyValue('border'),
    }).toEqual({ appearance: 'none', backgroundImage: 'none', boxShadow: 'none', border: '0' });
  });

  it('keeps a visible focus ring', () => {
    const focusRule = rules().find(rule => rule.selectorText === 'button.claudian-send-stop-btn:focus-visible');
    expect(focusRule?.style.getPropertyValue('outline')).toBe('2px solid var(--interactive-accent)');
  });
});
