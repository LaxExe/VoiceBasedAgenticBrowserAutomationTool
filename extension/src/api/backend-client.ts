// All fetch() calls to the Flask backend live here — nothing else in the extension talks to the network directly.

const BACKEND_URL = 'http://127.0.0.1:5000';

export interface Command {
  name: string;
  params: Record<string, any>;
}

export interface CommandPlan {
  commands: Command[];
}

export async function executeCommand(transcript: string, tabsSnapshot: any[] = []): Promise<CommandPlan> {
  const response = await fetch(`${BACKEND_URL}/execute-command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, tabs_snapshot: tabsSnapshot })
  });

  if (!response.ok) {
    throw new Error(`Backend request failed with status: ${response.status}`);
  }

  return response.json();
}

export async function notifyTabOpened(tab: chrome.tabs.Tab): Promise<void> {
  await fetch(`${BACKEND_URL}/tab-opened`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab })
  });
}

export async function notifyTabUpdated(tab: chrome.tabs.Tab): Promise<void> {
  await fetch(`${BACKEND_URL}/tab-updated`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab })
  });
}

export async function notifyTabClosed(tabId: number): Promise<void> {
  await fetch(`${BACKEND_URL}/tab-closed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab_id: tabId })
  });
}

export async function resyncTabs(tabs: chrome.tabs.Tab[]): Promise<void> {
  await fetch(`${BACKEND_URL}/resync-tabs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tabs })
  });
}

export async function sweepTabs(activeTabIds: number[]): Promise<void> {
  await fetch(`${BACKEND_URL}/sweep-tabs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active_tab_ids: activeTabIds })
  });
}

export async function uploadDom(tabId: number, innerText: string, interactiveElements: any[]): Promise<void> {
  await fetch(`${BACKEND_URL}/upload-dom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab_id: tabId, inner_text: innerText, interactive_elements: interactiveElements })
  });
}
