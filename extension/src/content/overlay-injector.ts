// Injects a floating overlay showing mic status (listening / thinking / speaking).

export class OverlayInjector {
  private overlay: HTMLDivElement | null = null;

  public mount() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('voice-extension-hud')) return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'voice-extension-hud';
    this.overlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      padding: 10px 16px;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      transition: all 0.3s ease;
      pointer-events: none;
      opacity: 0;
      transform: translateY(10px);
    `;

    this.overlay.innerHTML = `
      <span id="voice-hud-dot" style="
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #94a3b8;
        display: inline-block;
      "></span>
      <span id="voice-hud-text" style="font-weight: 500;">Voice Extension: Idle</span>
    `;

    document.body.appendChild(this.overlay);
  }

  public update(status: 'idle' | 'listening' | 'thinking' | 'speaking', detail?: string) {
    if (!this.overlay) {
      this.mount();
    }
    if (!this.overlay) return;

    const dot = document.getElementById('voice-hud-dot');
    const text = document.getElementById('voice-hud-text');

    if (!dot || !text) return;

    // Show overlay
    this.overlay.style.opacity = '1';
    this.overlay.style.transform = 'translateY(0)';

    let color = '#94a3b8';
    let label = 'Idle';
    let pulse = false;

    switch (status) {
      case 'listening':
        color = '#10b981';
        label = 'Listening...';
        pulse = true;
        break;
      case 'thinking':
        color = '#a855f7';
        label = 'Thinking...';
        pulse = true;
        break;
      case 'speaking':
        color = '#38bdf8';
        label = 'Speaking...';
        pulse = true;
        break;
      case 'idle':
      default:
        color = '#94a3b8';
        label = 'Idle';
        // Fade out overlay after 2 seconds on idle
        setTimeout(() => {
          if (this.overlay && this.overlay.style.opacity === '1') {
            this.overlay.style.opacity = '0';
            this.overlay.style.transform = 'translateY(10px)';
          }
        }, 3000);
        break;
    }

    dot.style.background = color;
    dot.style.boxShadow = color !== '#94a3b8' ? `0 0 8px ${color}` : 'none';
    
    if (pulse) {
      dot.animate([
        { transform: 'scale(0.9)', opacity: 0.6 },
        { transform: 'scale(1.2)', opacity: 1 },
        { transform: 'scale(0.9)', opacity: 0.6 }
      ], {
        duration: 1500,
        iterations: Infinity
      });
    }

    text.innerText = detail ? `Voice: ${detail}` : `Voice: ${label}`;
  }
}
