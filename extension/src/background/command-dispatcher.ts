// Takes the decision model's output (an ordered list of commands from chromium_commands.json)
// and executes each one against the real Chrome APIs, in order, stopping on first hard failure.
// Functions:
//   dispatch(commands: Command[]): Promise<CommandResult[]>
//   executeOne(command: Command): Promise<CommandResult>   // switch on command.name
// Delegates coordinate-based clicking/typing to debugger-controller.ts; everything else
// is a direct chrome.tabs / chrome.scripting / chrome.history / chrome.bookmarks call.
