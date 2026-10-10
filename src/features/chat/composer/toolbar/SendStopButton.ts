import { setIcon } from 'obsidian';

export interface SendStopCallbacks {
  onSend: () => void;
  onStop: () => void;
}

/** Composer action button: sends while idle, interrupts the turn while streaming. */
export class SendStopButton {
  private readonly buttonEl: HTMLButtonElement;
  private callbacks: SendStopCallbacks;
  private isSendable: () => boolean;
  private streaming = false;

  constructor(parentEl: HTMLElement, callbacks: SendStopCallbacks, isSendable: () => boolean) {
    this.callbacks = callbacks;
    this.isSendable = isSendable;
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

  /** Re-reads whether the composer holds anything to send. */
  refresh(): void {
    this.updateDisplay();
  }

  private activate(): void {
    if (this.streaming) {
      this.callbacks.onStop();
      return;
    }
    this.callbacks.onSend();
  }

  /** Only an idle button with nothing to send is inactive; a running turn stays interruptible. */
  private updateDisplay(): void {
    this.buttonEl.toggleClass('claudian-send-stop-btn--streaming', this.streaming);
    this.buttonEl.disabled = !this.streaming && !this.isSendable();
    setIcon(this.buttonEl, this.streaming ? 'square' : 'arrow-up');
    this.buttonEl.setAttribute('aria-label', this.streaming ? 'Stop generating' : 'Send message');
  }
}
