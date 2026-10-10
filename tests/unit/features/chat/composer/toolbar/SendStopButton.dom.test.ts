/** @jest-environment jsdom */

import { within } from '@testing-library/dom';
import { axe } from 'jest-axe';
import { setIcon } from 'obsidian';

import { SendStopButton } from '@/features/chat/composer/toolbar/SendStopButton';

HTMLElement.prototype.toggleClass = function (classes, value) {
  for (const name of typeof classes === 'string' ? [classes] : classes) this.classList.toggle(name, value);
};

function createButton() {
  const host = document.body.createDiv();
  const onSend = jest.fn();
  const onStop = jest.fn();
  const control = new SendStopButton(host, { onSend, onStop });
  const button = within(host).getByRole<HTMLButtonElement>('button', { name: 'Send message' });
  return { host, button, onSend, onStop, control };
}

afterEach(() => {
  document.body.replaceChildren();
  jest.clearAllMocks();
});

describe('SendStopButton', () => {
  it('sends while idle and interrupts while streaming', async () => {
    const { host, button, onSend, onStop, control } = createButton();
    expect(button.type).toBe('button');
    expect(await axe(host)).toHaveNoViolations();

    button.click();
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onStop).not.toHaveBeenCalled();

    control.setStreaming(true);
    const stop = within(host).getByRole<HTMLButtonElement>('button', { name: 'Stop generating' });
    expect(stop).toBe(button);
    expect(stop.classList.contains('claudian-send-stop-btn--streaming')).toBe(true);
    expect(await axe(host)).toHaveNoViolations();

    stop.click();
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledTimes(1);

    control.setStreaming(false);
    expect(within(host).getByRole<HTMLButtonElement>('button', { name: 'Send message' })).toBe(button);
    expect(button.classList.contains('claudian-send-stop-btn--streaming')).toBe(false);
    button.click();
    expect(onSend).toHaveBeenCalledTimes(2);
  });

  it('swaps the icon with the streaming state', () => {
    const { button, control } = createButton();
    expect(setIcon).toHaveBeenLastCalledWith(button, 'arrow-up');

    control.setStreaming(true);
    expect(setIcon).toHaveBeenLastCalledWith(button, 'square');

    control.setStreaming(false);
    expect(setIcon).toHaveBeenLastCalledWith(button, 'arrow-up');
  });
});
