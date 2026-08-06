// Wraps chrome.debugger attach/detach + sendCommand for tier-3 (vision/coordinate) actions.
// Functions:
//   attach(tabId): Promise<void>
//   click(tabId, x, y): Promise<void>        // Input.dispatchMouseEvent (pressed + released)
//   type(tabId, text): Promise<void>         // Input.insertText
//   pressKey(tabId, key): Promise<void>      // Input.dispatchKeyEvent
//   detach(tabId): Promise<void>             // ALWAYS detach after the step completes
// Surfaces the "this tab is being debugged" infobar state to the side-panel log.
