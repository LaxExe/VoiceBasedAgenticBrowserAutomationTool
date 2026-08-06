// All fetch() calls to the Flask backend live here — nothing else in the extension talks to the network directly.
// Functions:
//   executeCommand(transcript, tabsSnapshot): Promise<CommandPlan>   // POST /execute-command
//   notifyTabOpened(tab): Promise<void>                              // POST /tab-opened
//   notifyTabClosed(tabId): Promise<void>                            // POST /tab-closed
