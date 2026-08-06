import { Command, CommandPlan, uploadDom } from '../api/backend-client';

export interface CommandResult {
  name: string;
  success: boolean;
  error?: string;
  result?: any;
}

export async function dispatch(commands: Command[]): Promise<CommandResult[]> {
  const results: CommandResult[] = [];
  for (const command of commands) {
    try {
      console.log(`Executing command: ${command.name}`, command.params);
      const res = await executeOne(command);
      results.push(res);
      if (!res.success) {
        console.error(`Command ${command.name} failed. Stopping execution.`, res.error);
        break;
      }
    } catch (err: any) {
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

export async function executeOne(command: Command): Promise<CommandResult> {
  const params = command.params || {};
  let result: any = null;

  switch (command.name) {
    case 'open_tab': {
      const createProperties: chrome.tabs.CreateProperties = {};
      if (typeof params.url === 'string') createProperties.url = params.url;
      if (typeof params.active === 'boolean') createProperties.active = params.active;
      if (typeof params.windowId === 'number') createProperties.windowId = params.windowId;
      result = await chrome.tabs.create(createProperties);
      break;
    }

    case 'close_tab': {
      const tabIds = params.tabIds;
      if (tabIds === undefined) {
        throw new Error("Missing parameter 'tabIds'");
      }
      await chrome.tabs.remove(tabIds);
      break;
    }

    case 'go_to_url': {
      if (typeof params.url !== 'string') {
        throw new Error("Missing or invalid parameter 'url'");
      }
      const updateProperties: chrome.tabs.UpdateProperties = { url: params.url };
      const tabId = typeof params.tabId === 'number' ? params.tabId : undefined;
      result = await chrome.tabs.update(tabId, updateProperties);
      break;
    }

    case 'go_back': {
      const tabId = typeof params.tabId === 'number' ? params.tabId : undefined;
      await chrome.tabs.goBack(tabId);
      break;
    }

    case 'go_forward': {
      const tabId = typeof params.tabId === 'number' ? params.tabId : undefined;
      await chrome.tabs.goForward(tabId);
      break;
    }

    case 'reload_tab': {
      const tabId = typeof params.tabId === 'number' ? params.tabId : undefined;
      const reloadProperties = { bypassCache: params.bypassCache === true };
      await chrome.tabs.reload(tabId, reloadProperties);
      break;
    }

    case 'mute_tab': {
      if (typeof params.muted !== 'boolean') {
        throw new Error("Missing or invalid parameter 'muted'");
      }
      const tabId = typeof params.tabId === 'number' ? params.tabId : undefined;
      result = await chrome.tabs.update(tabId, { muted: params.muted });
      break;
    }

    case 'bookmark_tab': {
      if (typeof params.title !== 'string' || typeof params.url !== 'string') {
        throw new Error("Missing 'title' or 'url' parameters");
      }
      const bookmarkDetails: chrome.bookmarks.CreateDetails = {
        title: params.title,
        url: params.url
      };
      if (typeof params.parentId === 'string') {
        bookmarkDetails.parentId = params.parentId;
      }
      result = await chrome.bookmarks.create(bookmarkDetails);
      break;
    }

    case 'get_page_text': {
      let tabId = params.tabId;
      if (tabId === undefined) {
        const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTabs.length > 0) {
          tabId = activeTabs[0].id;
        }
      }
      if (tabId === undefined) {
        throw new Error("No active tab found to extract text");
      }
      
      const domResponse = await chrome.tabs.sendMessage(tabId, { type: 'extract-dom' });
      if (domResponse && domResponse.success) {
        const { innerText, interactiveElements } = domResponse;
        await uploadDom(tabId, innerText, interactiveElements);
        result = { innerText, interactiveElements };
      } else {
        throw new Error(domResponse?.error || "Failed to extract DOM");
      }
      break;
    }

    case 'scroll': {
      let tabId = params.tabId;
      if (tabId === undefined) {
        const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTabs.length > 0) {
          tabId = activeTabs[0].id;
        }
      }
      if (tabId === undefined) {
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
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return;
            }
          }
          
          const distance = window.innerHeight * 0.7;
          if (dir === 'up') {
            window.scrollBy({ top: -distance, behavior: 'smooth' });
          } else if (dir === 'down') {
            window.scrollBy({ top: distance, behavior: 'smooth' });
          } else if (dir === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (dir === 'bottom') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
