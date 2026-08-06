export interface InteractiveElement {
  selector: string;
  role: string;
  label: string;
}

export function extractVisibleText(): string {
  // Extract visible inner text from document body, cleaning duplicate spaces/lines
  if (!document.body) return '';
  return document.body.innerText
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function extractInteractiveElements(): InteractiveElement[] {
  const elements: InteractiveElement[] = [];
  const query = 'a, button, input, select, textarea, [role="button"], [role="link"], [tabindex]';
  const nodes = document.querySelectorAll(query);

  nodes.forEach((node, index) => {
    const el = node as HTMLElement;
    
    // Skip hidden elements
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return;

    let role = el.tagName.toLowerCase();
    if (el.getAttribute('role')) {
      role = el.getAttribute('role') || role;
    }

    let label = el.innerText?.trim() || '';
    if (!label && el.getAttribute('placeholder')) {
      label = el.getAttribute('placeholder') || '';
    }
    if (!label && el.getAttribute('aria-label')) {
      label = el.getAttribute('aria-label') || '';
    }
    if (!label && (el as HTMLInputElement).value) {
      label = (el as HTMLInputElement).value;
    }

    // Generate a simple query selector or path
    let selector = '';
    if (el.id) {
      selector = `#${el.id}`;
    } else {
      const cls = el.className ? `.${Array.from(el.classList).join('.')}` : '';
      selector = `${el.tagName.toLowerCase()}${cls}:nth-child(${index + 1})`;
    }

    elements.push({ selector, role, label: label.substring(0, 100) });
  });

  return elements.slice(0, 100); // Limit to top 100 elements to keep payloads small
}
