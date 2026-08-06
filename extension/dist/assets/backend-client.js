const BACKEND_URL = "http://127.0.0.1:5000";
async function executeCommand(transcript, tabsSnapshot = []) {
  const response = await fetch(`${BACKEND_URL}/execute-command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, tabs_snapshot: tabsSnapshot })
  });
  if (!response.ok) {
    throw new Error(`Backend request failed with status: ${response.status}`);
  }
  return response.json();
}
async function notifyTabOpened(tab) {
  await fetch(`${BACKEND_URL}/tab-opened`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab })
  });
}
async function notifyTabUpdated(tab) {
  await fetch(`${BACKEND_URL}/tab-updated`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab })
  });
}
async function notifyTabClosed(tabId) {
  await fetch(`${BACKEND_URL}/tab-closed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab_id: tabId })
  });
}
async function resyncTabs(tabs) {
  await fetch(`${BACKEND_URL}/resync-tabs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tabs })
  });
}
async function sweepTabs(activeTabIds) {
  await fetch(`${BACKEND_URL}/sweep-tabs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active_tab_ids: activeTabIds })
  });
}
async function uploadDom(tabId, innerText, interactiveElements) {
  await fetch(`${BACKEND_URL}/upload-dom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tab_id: tabId, inner_text: innerText, interactive_elements: interactiveElements })
  });
}
export {
  notifyTabUpdated as a,
  notifyTabClosed as b,
  executeCommand as e,
  notifyTabOpened as n,
  resyncTabs as r,
  sweepTabs as s,
  uploadDom as u
};
