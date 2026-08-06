function extractVisibleText() {
  if (!document.body) return "";
  return document.body.innerText.replace(/[ \t]+/g, " ").replace(/\n\s*\n/g, "\n").trim();
}
function extractInteractiveElements() {
  const elements = [];
  const query = 'a, button, input, select, textarea, [role="button"], [role="link"], [tabindex]';
  const nodes = document.querySelectorAll(query);
  nodes.forEach((node, index) => {
    var _a;
    const el = node;
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
    let role = el.tagName.toLowerCase();
    if (el.getAttribute("role")) {
      role = el.getAttribute("role") || role;
    }
    let label = ((_a = el.innerText) == null ? void 0 : _a.trim()) || "";
    if (!label && el.getAttribute("placeholder")) {
      label = el.getAttribute("placeholder") || "";
    }
    if (!label && el.getAttribute("aria-label")) {
      label = el.getAttribute("aria-label") || "";
    }
    if (!label && el.value) {
      label = el.value;
    }
    let selector = "";
    if (el.id) {
      selector = `#${el.id}`;
    } else {
      const cls = el.className ? `.${Array.from(el.classList).join(".")}` : "";
      selector = `${el.tagName.toLowerCase()}${cls}:nth-child(${index + 1})`;
    }
    elements.push({ selector, role, label: label.substring(0, 100) });
  });
  return elements.slice(0, 100);
}
class OverlayInjector {
  constructor() {
    this.overlay = null;
  }
  mount() {
    if (typeof document === "undefined") return;
    if (document.getElementById("voice-extension-hud")) return;
    this.overlay = document.createElement("div");
    this.overlay.id = "voice-extension-hud";
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
  update(status, detail) {
    if (!this.overlay) {
      this.mount();
    }
    if (!this.overlay) return;
    const dot = document.getElementById("voice-hud-dot");
    const text = document.getElementById("voice-hud-text");
    if (!dot || !text) return;
    this.overlay.style.opacity = "1";
    this.overlay.style.transform = "translateY(0)";
    let color = "#94a3b8";
    let label = "Idle";
    let pulse = false;
    switch (status) {
      case "listening":
        color = "#10b981";
        label = "Listening...";
        pulse = true;
        break;
      case "thinking":
        color = "#a855f7";
        label = "Thinking...";
        pulse = true;
        break;
      case "speaking":
        color = "#38bdf8";
        label = "Speaking...";
        pulse = true;
        break;
      case "idle":
      default:
        color = "#94a3b8";
        label = "Idle";
        setTimeout(() => {
          if (this.overlay && this.overlay.style.opacity === "1") {
            this.overlay.style.opacity = "0";
            this.overlay.style.transform = "translateY(10px)";
          }
        }, 3e3);
        break;
    }
    dot.style.background = color;
    dot.style.boxShadow = color !== "#94a3b8" ? `0 0 8px ${color}` : "none";
    if (pulse) {
      dot.animate([
        { transform: "scale(0.9)", opacity: 0.6 },
        { transform: "scale(1.2)", opacity: 1 },
        { transform: "scale(0.9)", opacity: 0.6 }
      ], {
        duration: 1500,
        iterations: Infinity
      });
    }
    text.innerText = detail ? `Voice: ${detail}` : `Voice: ${label}`;
  }
}
console.log("Voice extension content script injected.");
const hud = new OverlayInjector();
hud.mount();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "extract-dom") {
    try {
      const innerText = extractVisibleText();
      const interactiveElements = extractInteractiveElements();
      sendResponse({ success: true, innerText, interactiveElements });
    } catch (e) {
      sendResponse({ success: false, error: e.message || String(e) });
    }
    return true;
  }
  if (message.type === "update-hud") {
    try {
      hud.update(message.status, message.detail);
      sendResponse({ success: true });
    } catch (e) {
      sendResponse({ success: false, error: e.message || String(e) });
    }
  }
});
