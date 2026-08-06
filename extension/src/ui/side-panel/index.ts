import { SpeechRecognitionWrapper } from '../../voice/speech-recognition';
import { WakeKeyListener } from '../../voice/wake-key-listener';
import { executeCommand } from '../../api/backend-client';
import { SpeechSynthesisWrapper } from '../../voice/speech-synthesis';

const micStatus = document.getElementById('micStatus') as HTMLDivElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const transcriptBox = document.getElementById('transcriptBox') as HTMLDivElement;
const logBox = document.getElementById('logBox') as HTMLDivElement;

const synth = new SpeechSynthesisWrapper();

function addLog(message: string) {
  const time = new Date().toLocaleTimeString();
  logBox.innerHTML = `[${time}] ${message}\n` + logBox.innerHTML;
}

async function getSetting(key: string, defaultValue = true): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (data) => {
      resolve(data[key] !== undefined ? data[key] : defaultValue);
    });
  });
}

async function speakFeedback(text: string) {
  if (await getSetting('audioFeedback', true)) {
    synth.speak(text);
  }
}

async function updateHUD(status: 'idle' | 'listening' | 'thinking' | 'speaking', detail?: string) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0 && tabs[0].id !== undefined) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'update-hud', status, detail });
    }
  } catch (e) {
    // No active tab or content script is not loaded
  }
}

const speech = new SpeechRecognitionWrapper();

speech.onResult((text) => {
  transcriptBox.innerText = text;
});

speech.onError((err) => {
  addLog(`Error: ${err}`);
  updateHUD('idle');
});

const keyListener = new WakeKeyListener(
  async () => {
    micStatus.classList.add('listening');
    statusText.innerText = 'Listening';
    transcriptBox.innerText = '';
    addLog('Recording started (Ctrl held down)...');
    speakFeedback('Listening');
    updateHUD('listening');
    speech.start();
  },
  async () => {
    micStatus.classList.remove('listening');
    statusText.innerText = 'Idle';
    addLog('Recording stopped (Ctrl released). Processing...');
    speakFeedback('Thinking');
    updateHUD('thinking');
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
            speakFeedback('Executing commands');
            updateHUD('speaking', 'Executing Plan');
            
            chrome.runtime.sendMessage(
              { type: 'execute-commands', commands: data.commands },
              async (response) => {
                if (chrome.runtime.lastError) {
                  addLog(`Dispatch error: ${chrome.runtime.lastError.message}`);
                  speakFeedback('Execution failed');
                  updateHUD('idle', 'Execution Failed');
                } else {
                  addLog(`Dispatch status: ${JSON.stringify(response)}`);
                  speakFeedback('Done');
                  updateHUD('idle', 'Finished');
                }
              }
            );
          } else {
            addLog('No commands returned.');
            speakFeedback('No commands formulated');
            updateHUD('idle');
          }
        } catch (error: any) {
          addLog(`Backend call failed: ${error.message}`);
          speakFeedback('Server request failed');
          updateHUD('idle');
        }
      } else {
        addLog('No transcript captured.');
        updateHUD('idle');
      }
    }, 500);
  }
);

keyListener.bind(window);
keyListener.bind(document);

addLog('Sidepanel ready.');
