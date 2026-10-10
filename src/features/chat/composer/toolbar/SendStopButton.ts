import { setIcon } from 'obsidian';

export interface SendStopCallbacks {
  onSend: () => void;
  onStop: () => void;
}

/** Composer action button: sends while idle, interrupts the turn while streaming. */
export class SendStopButton {
  private readonly buttonEl: HTMLButtonElement;
  private callbacks: SendStopCallbacks;
  private streaming = false;

  constructor(parentEl: HTMLElement, callbacks: SendStopCallbacks) {
    this.callbacks = callbacks;
    const container = parentEl.createDiv({ cls: 'claudian-send-stop-container' });
    this.buttonEl = container.createEl('button', {
      cls: 'claudian-send-stop-btn',
      attr: { type: 'button' },
    });
    this.buttonEl.addEventListener('click', () => this.activate());
    this.updateDisplay();
  }

  setStreaming(streaming: boolean): void {
    if (this.streaming === streaming) return;
    this.streaming = streaming;
    this.updateDisplay();
  }

  private activate(): void {
    if (this.streaming) {
      this.callbacks.onStop();
      return;
    }
    this.callbacks.onSend();
  }

  private updateDisplay(): void {
    this.buttonEl.toggleClass('claudian-send-stop-btn--streaming', this.streaming);
    setIcon(this.buttonEl, this.streaming ? 'square' : 'arrow-up');
    const label = this.streaming ? 'Stop generating' : 'Send message';
    this.buttonEl.setAttribute('aria-label', label);
    this.buttonEl.setAttribute('title', label);
  }
}
