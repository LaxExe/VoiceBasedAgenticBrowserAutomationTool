// Listens for the Ctrl-key hold-to-talk gesture and starts/stops speech recognition accordingly.

export class WakeKeyListener {
  private isListening = false;
  private onStart: () => void;
  private onStop: () => void;

  constructor(onStart: () => void, onStop: () => void) {
    this.onStart = onStart;
    this.onStop = onStop;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  public bind(target: EventTarget = window) {
    target.addEventListener('keydown', this.handleKeyDown as EventListener);
    target.addEventListener('keyup', this.handleKeyUp as EventListener);
  }

  public unbind(target: EventTarget = window) {
    target.removeEventListener('keydown', this.handleKeyDown as EventListener);
    target.removeEventListener('keyup', this.handleKeyUp as EventListener);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Control' && !this.isListening) {
      this.isListening = true;
      this.onStart();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Control' && this.isListening) {
      this.isListening = false;
      this.onStop();
    }
  }
}
