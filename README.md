# Voice Browser Control — Hands-Free Agentic Browser Automation

Voice Browser Control is a Manifest V3 Chrome extension that lets you drive your browser by voice. Hold a key, say what you want, and an LLM planner picks the **cheapest reliable way** to do it. Simple commands never touch a vision model. A **Parallel Mode** lets background actions run without pulling focus from your current tab.

---

## Key Features

- 🎙️ **Push-to-Talk Voice Control**: Hold **Ctrl** to record with the Web Speech API, with optional spoken replies through speech synthesis.
- 🧠 **Two-Stage Model Routing**: A small model classifies the request and picks only the data it needs. A decision model then plans the commands. No hardcoded regex rules.
- 💸 **Tiered Execution**: Cheap Chrome API calls come first (tier 1), then DOM text and elements, with screenshot-based vision only as a last resort (`escalate_to_vision`).
- 🪟 **Parallel Mode**: Open and act on background tabs without stealing focus.
- 🗂️ **19-Command Catalog**: Open, close, switch, group and bookmark tabs, navigate, scroll, zoom, mute, read page text, click, type, press keys, and more. See [`chromium_commands.json`](backend/schemas/chromium_commands.json).
- 🔄 **Self-Healing Tab State**: Exactly one row per open tab, cleaned up on close, with a periodic sweep and a full resync whenever Chrome restarts the service worker.
- 🧩 **Lazy Data Retrieval**: Page text, interactive elements and screenshots are fetched only when the small model asks for them.
- 🪂 **Low-Confidence Fallback**: If nothing is selected, the decision model plans from the transcript and command catalog alone.

---

## 🧭 How It Works

```
Hold Ctrl → Web Speech API → transcript
        │
        ▼
POST /execute-command
        │
        ▼
Small model: classify + select data headers + shortlist commands
        │
        ▼
Backend gathers ONLY the selected data (tabs · DOM · screenshots)
        │
        ▼
Decision model: ordered Command[]
        │
        ▼
Extension command-dispatcher runs each command via chrome.* APIs
```

Deeper notes are in [`docs/architecture.md`](docs/architecture.md).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Extension | Chrome Manifest V3, TypeScript, Vite |
| Voice | Web Speech API (recognition + synthesis) |
| Backend | Python, Flask, Flask-CORS |
| Models | NVIDIA-hosted LLMs via an OpenAI-compatible client (Anthropic client also included) |
| Storage | Supabase (Postgres) |

---

## 🚀 How to Build & Run

### Prerequisites
- **Google Chrome** (or another Chromium browser)
- **Node.js** 20+
- **Python** 3.10+
- A **Supabase** project and an **NVIDIA API key**

### 1. Set up the database
Run [`backend/db/schema.sql`](backend/db/schema.sql) in the Supabase SQL editor to create the `tabs`, `dom_data` and `screenshots` tables.

### 2. Start the backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```
Create `backend/.env`:
```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<service-key>
SUPABASE_ANON_KEY=<anon-key>
NVIDIA_API_KEY=<nvidia-key>
# Optional overrides
# SMALL_MODEL_NAME=...
# DECISION_MODEL_NAME=...
```
Then run the server:
```bash
python app.py
```
Check it with `curl http://127.0.0.1:5000/health`.

### 3. Build the extension
```bash
cd extension
npm install
npm run build        # or: npm run dev  (watch mode)
```

### 4. Load it in Chrome
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select `extension/dist`.
3. Open the side panel, hold **Ctrl**, and speak a command such as *"open YouTube in a new tab"*.

---

## 🧪 Running Tests

```bash
cd backend
python -m pytest tests
```

---

## 🔌 Backend API

| Route | Description |
|---|---|
| `POST /execute-command` | Transcript in, ordered commands out |
| `POST /tab-opened`, `/tab-updated`, `/tab-closed` | Keep the tab registry in sync |
| `POST /resync-tabs` | Rebuild all state after a service-worker restart |
| `POST /sweep-tabs` | Safety-net cleanup of stale tabs |
| `POST /upload-dom` | Store extracted page text and interactive elements |
| `GET /health` | Liveness check |

---

## 🏗️ Architecture

```
VoiceBasedAgenticBrowserAutomationTool/
├── docs/
│   └── architecture.md        # Flow, tab lifecycle, restart resync
├── backend/
│   ├── app.py                 # Flask app factory
│   ├── config.py              # Env-based configuration
│   ├── routes/                # execute_command, tab_sync, health
│   ├── models/                # small_model, decision_model + prompts
│   ├── services/              # tab_registry, dom_cache, screenshot_store,
│   │                          # cleanup_service, nvidia/claude clients
│   ├── schemas/               # chromium_commands.json, available_data_schema.json
│   ├── db/                    # schema.sql, Supabase client
│   └── tests/
└── extension/
    ├── manifest.json
    └── src/
        ├── background/        # service-worker, command-dispatcher, tab-manager,
        │                      # debugger-controller, cache-manager
        ├── content/           # content-script, dom-extractor, overlay-injector
        ├── voice/             # wake-key-listener, speech-recognition, speech-synthesis
        ├── api/               # backend-client
        └── ui/                # popup, side-panel
```
