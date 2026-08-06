// Shared TS types mirroring backend/schemas/chromium_commands.json — keep these two in sync manually
// (or generate this file from the JSON schema as a build step later).
export interface Command { name: string; params: Record<string, unknown>; }
export interface CommandResult { name: string; ok: boolean; error?: string; }
