// Thin wrapper around the Web Speech API (SpeechRecognition).
// Functions: start(), stop(), onResult(callback), onError(callback)

export class SpeechRecognitionWrapper {
  private recognition: any;
  private resultCallback: ((text: string) => void) | null = null;
  private errorCallback: ((err: any) => void) | null = null;
  private finalTranscript = '';

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
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

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (this.errorCallback) {
        this.errorCallback(event.error);
      }
    };
  }

  public start() {
    if (!this.recognition) return;
    this.finalTranscript = '';
    try {
      this.recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  }

  public stop() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.error("Failed to stop speech recognition:", e);
    }
  }

  public onResult(callback: (text: string) => void) {
    this.resultCallback = callback;
  }

  public onError(callback: (err: any) => void) {
    this.errorCallback = callback;
  }
}
