import { notifyTabOpened, notifyTabUpdated, notifyTabClosed, resyncTabs, sweepTabs } from '../api/backend-client';

export function initializeTabListeners() {
  chrome.tabs.onCreated.addListener(async (tab) => {
    console.log("tab-manager: Tab created:", tab.id, tab.url || tab.pendingUrl);
    try {
      await notifyTabOpened(tab);
    } catch (e) {
      console.error("tab-manager: Error notifying tab opened:", e);
    }
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' || changeInfo.url || changeInfo.title) {
      console.log("tab-manager: Tab updated:", tabId, changeInfo, tab.url);
      try {
        await notifyTabUpdated(tab);
      } catch (e) {
        console.error("tab-manager: Error notifying tab updated:", e);
      }
    }
  });

  chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    console.log("tab-manager: Tab removed:", tabId, removeInfo);
    try {
      await notifyTabClosed(tabId);
    } catch (e) {
      console.error("tab-manager: Error notifying tab closed:", e);
    }
  });
}

export async function resyncAllTabs() {
  console.log("tab-manager: Performing full resync...");
  try {
    const tabs = await chrome.tabs.query({});
    await resyncTabs(tabs);
    console.log(`tab-manager: Resynced ${tabs.length} tab(s) to backend.`);
  } catch (e) {
    console.error("tab-manager: Error during resync:", e);
  }
}

export function startPeriodicSweep() {
  // Set up an alarm to trigger a sweep every 2 minutes
  chrome.alarms.create('tab-sweep-alarm', { periodInMinutes: 2 });
  
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'tab-sweep-alarm') {
      console.log("tab-manager: Running periodic tab sweep...");
      try {
        const tabs = await chrome.tabs.query({});
        const activeIds = tabs.map(t => t.id).filter((id): id is number => id !== undefined);
        await sweepTabs(activeIds);
      } catch (e) {
        console.error("tab-manager: Sweep failed:", e);
      }
    }
  });
}
