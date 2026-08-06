import "./modulepreload-polyfill.js";
import { e as executeCommand } from "./backend-client.js";
class SpeechRecognitionWrapper {
  constructor() {
    this.resultCallback = null;
    this.errorCallback = null;
    this.finalTranscript = "";
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const displayTranscript = this.finalTranscript + interimTranscript;
      if (this.resultCallback) {
        this.resultCallback(displayTranscript);
      }
    };
    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (this.errorCallback) {
        this.errorCallback(event.error);
      }
    };
  }
  start() {
    if (!this.recognition) return;
    this.finalTranscript = "";
    try {
      this.recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  }
  stop() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.error("Failed to stop speech recognition:", e);
    }
  }
  onResult(callback) {
    this.resultCallback = callback;
  }
  onError(callback) {
    this.errorCallback = callback;
  }
}
class WakeKeyListener {
  constructor(onStart, onStop) {
    this.isListening = false;
    this.onStart = onStart;
    this.onStop = onStop;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  bind(target = window) {
    target.addEventListener("keydown", this.handleKeyDown);
    target.addEventListener("keyup", this.handleKeyUp);
  }
  unbind(target = window) {
    target.removeEventListener("keydown", this.handleKeyDown);
    target.removeEventListener("keyup", this.handleKeyUp);
  }
  handleKeyDown(e) {
    if (e.key === "Control" && !this.isListening) {
      this.isListening = true;
      this.onStart();
    }
  }
  handleKeyUp(e) {
    if (e.key === "Control" && this.isListening) {
      this.isListening = false;
      this.onStop();
    }
  }
}
class SpeechSynthesisWrapper {
  speak(text) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("SpeechSynthesis API is not supported in this environment.");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("SpeechSynthesis speak failed:", e);
    }
  }
}
const micStatus = document.getElementById("micStatus");
const statusText = document.getElementById("statusText");
const transcriptBox = document.getElementById("transcriptBox");
const logBox = document.getElementById("logBox");
const synth = new SpeechSynthesisWrapper();
function addLog(message) {
  const time = (/* @__PURE__ */ new Date()).toLocaleTimeString();
  logBox.innerHTML = `[${time}] ${message}
` + logBox.innerHTML;
}
async function getSetting(key, defaultValue = true) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (data) => {
      resolve(data[key] !== void 0 ? data[key] : defaultValue);
    });
  });
}
async function speakFeedback(text) {
  if (await getSetting("audioFeedback", true)) {
    synth.speak(text);
  }
}
async function updateHUD(status, detail) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0 && tabs[0].id !== void 0) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "update-hud", status, detail });
    }
  } catch (e) {
  }
}
const speech = new SpeechRecognitionWrapper();
speech.onResult((text) => {
  transcriptBox.innerText = text;
});
speech.onError((err) => {
  addLog(`Error: ${err}`);
  updateHUD("idle");
});
const keyListener = new WakeKeyListener(
  async () => {
    micStatus.classList.add("listening");
    statusText.innerText = "Listening";
    transcriptBox.innerText = "";
    addLog("Recording started (Ctrl held down)...");
    speakFeedback("Listening");
    updateHUD("listening");
    speech.start();
  },
  async () => {
    micStatus.classList.remove("listening");
    statusText.innerText = "Idle";
    addLog("Recording stopped (Ctrl released). Processing...");
    speakFeedback("Thinking");
    updateHUD("thinking");
    speech.stop();
    setTimeout(async () => {
      const transcript = transcriptBox.innerText.trim();
      if (transcript) {
        addLog(`Transcript captured: "${transcript}"`);
        try {
          addLog(`Sending to backend: "${transcript}"...`);
          const data = await executeCommand(transcript);
          addLog(`Backend response: ${JSON.stringify(data)}`);
          if (data && data.commands && data.commands.length > 0) {
            addLog(`Dispatching ${data.commands.length} command(s)...`);
            speakFeedback("Executing commands");
            updateHUD("speaking", "Executing Plan");
            chrome.runtime.sendMessage(
              { type: "execute-commands", commands: data.commands },
              async (response) => {
                if (chrome.runtime.lastError) {
                  addLog(`Dispatch error: ${chrome.runtime.lastError.message}`);
                  speakFeedback("Execution failed");
                  updateHUD("idle", "Execution Failed");
                } else {
                  addLog(`Dispatch status: ${JSON.stringify(response)}`);
                  speakFeedback("Done");
                  updateHUD("idle", "Finished");
                }
              }
            );
          } else {
            addLog("No commands returned.");
            speakFeedback("No commands formulated");
            updateHUD("idle");
          }
        } catch (error) {
          addLog(`Backend call failed: ${error.message}`);
          speakFeedback("Server request failed");
          updateHUD("idle");
        }
      } else {
        addLog("No transcript captured.");
        updateHUD("idle");
      }
    }, 500);
  }
);
keyListener.bind(window);
keyListener.bind(document);
addLog("Sidepanel ready.");
