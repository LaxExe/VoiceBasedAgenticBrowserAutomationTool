// Wrapper around SpeechSynthesis for spoken status updates.

export class SpeechSynthesisWrapper {
  public speak(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("SpeechSynthesis API is not supported in this environment.");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("SpeechSynthesis speak failed:", e);
    }
  }
}
