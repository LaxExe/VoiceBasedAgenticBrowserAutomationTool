import { u as uploadDom, n as notifyTabOpened, a as notifyTabUpdated, b as notifyTabClosed, r as resyncTabs, s as sweepTabs } from "../../assets/backend-client.js";
async function dispatch(commands) {
  const results = [];
  for (const command of commands) {
    try {
      console.log(`Executing command: ${command.name}`, command.params);
      const res = await executeOne(command);
      results.push(res);
      if (!res.success) {
        console.error(`Command ${command.name} failed. Stopping execution.`, res.error);
        break;
      }
    } catch (err) {
      console.error(`Exception executing command ${command.name}:`, err);
      results.push({
        name: command.name,
        success: false,
        error: err.message || String(err)
      });
      break;
    }
  }
  return results;
}
async function executeOne(command) {
  const params = command.params || {};
  let result = null;
  switch (command.name) {
    case "open_tab": {
      const createProperties = {};
      if (typeof params.url === "string") createProperties.url = params.url;
      if (typeof params.active === "boolean") createProperties.active = params.active;
      if (typeof params.windowId === "number") createProperties.windowId = params.windowId;
      result = await chrome.tabs.create(createProperties);
      break;
    }
    case "close_tab": {
      const tabIds = params.tabIds;
      if (tabIds === void 0) {
        throw new Error("Missing parameter 'tabIds'");
      }
      await chrome.tabs.remove(tabIds);
      break;
    }
    case "go_to_url": {
      if (typeof params.url !== "string") {
        throw new Error("Missing or invalid parameter 'url'");
      }
      const updateProperties = { url: params.url };
      const tabId = typeof params.tabId === "number" ? params.tabId : void 0;
      result = await chrome.tabs.update(tabId, updateProperties);
      break;
    }
    case "go_back": {
      const tabId = typeof params.tabId === "number" ? params.tabId : void 0;
      await chrome.tabs.goBack(tabId);
      break;
    }
    case "go_forward": {
      const tabId = typeof params.tabId === "number" ? params.tabId : void 0;
      await chrome.tabs.goForward(tabId);
      break;
    }
    case "reload_tab": {
      const tabId = typeof params.tabId === "number" ? params.tabId : void 0;
      const reloadProperties = { bypassCache: params.bypassCache === true };
      await chrome.tabs.reload(tabId, reloadProperties);
      break;
    }
    case "mute_tab": {
      if (typeof params.muted !== "boolean") {
        throw new Error("Missing or invalid parameter 'muted'");
      }
      const tabId = typeof params.tabId === "number" ? params.tabId : void 0;
      result = await chrome.tabs.update(tabId, { muted: params.muted });
      break;
    }
    case "bookmark_tab": {
      if (typeof params.title !== "string" || typeof params.url !== "string") {
        throw new Error("Missing 'title' or 'url' parameters");
      }
      const bookmarkDetails = {
        title: params.title,
        url: params.url
      };
      if (typeof params.parentId === "string") {
        bookmarkDetails.parentId = params.parentId;
      }
      result = await chrome.bookmarks.create(bookmarkDetails);
      break;
    }
    case "get_page_text": {
      let tabId = params.tabId;
      if (tabId === void 0) {
        const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTabs.length > 0) {
          tabId = activeTabs[0].id;
        }
      }
      if (tabId === void 0) {
        throw new Error("No active tab found to extract text");
      }
      const domResponse = await chrome.tabs.sendMessage(tabId, { type: "extract-dom" });
      if (domResponse && domResponse.success) {
        const { innerText, interactiveElements } = domResponse;
        await uploadDom(tabId, innerText, interactiveElements);
        result = { innerText, interactiveElements };
      } else {
        throw new Error((domResponse == null ? void 0 : domResponse.error) || "Failed to extract DOM");
      }
      break;
    }
    case "scroll": {
      let tabId = params.tabId;
      if (tabId === void 0) {
        const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTabs.length > 0) {
          tabId = activeTabs[0].id;
        }
      }
      if (tabId === void 0) {
        throw new Error("No tab found to scroll");
      }
      const direction = params.direction;
      const targetSelector = params.targetSelector;
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (dir, selector) => {
          if (selector) {
            const el = document.querySelector(selector);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              return;
            }
          }
          const distance = window.innerHeight * 0.7;
          if (dir === "up") {
            window.scrollBy({ top: -distance, behavior: "smooth" });
          } else if (dir === "down") {
            window.scrollBy({ top: distance, behavior: "smooth" });
          } else if (dir === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (dir === "bottom") {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }
        },
        args: [direction, targetSelector]
      });
      break;
    }
    default:
      throw new Error(`Unsupported command name: ${command.name}`);
  }
  return {
    name: command.name,
    success: true,
    result
  };
}
function initializeTabListeners() {
  chrome.tabs.onCreated.addListener(async (tab) => {
    console.log("tab-manager: Tab created:", tab.id, tab.url || tab.pendingUrl);
    try {
      await notifyTabOpened(tab);
    } catch (e) {
      console.error("tab-manager: Error notifying tab opened:", e);
    }
  });
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" || changeInfo.url || changeInfo.title) {
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
async function resyncAllTabs() {
  console.log("tab-manager: Performing full resync...");
  try {
    const tabs = await chrome.tabs.query({});
    await resyncTabs(tabs);
    console.log(`tab-manager: Resynced ${tabs.length} tab(s) to backend.`);
  } catch (e) {
    console.error("tab-manager: Error during resync:", e);
  }
}
function startPeriodicSweep() {
  chrome.alarms.create("tab-sweep-alarm", { periodInMinutes: 2 });
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "tab-sweep-alarm") {
      console.log("tab-manager: Running periodic tab sweep...");
      try {
        const tabs = await chrome.tabs.query({});
        const activeIds = tabs.map((t) => t.id).filter((id) => id !== void 0);
        await sweepTabs(activeIds);
      } catch (e) {
        console.error("tab-manager: Sweep failed:", e);
      }
    }
  });
}
console.log("Service Worker started.");
initializeTabListeners();
resyncAllTabs();
startPeriodicSweep();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "execute-commands") {
    dispatch(message.commands).then((results) => {
      sendResponse({ success: true, results });
    }).catch((err) => {
      sendResponse({ success: false, error: err.message || String(err) });
    });
    return true;
  }
});
