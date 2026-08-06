// Listens for the Ctrl-key hold-to-talk gesture and starts/stops speech-recognition.ts accordingly.
// Functions:
//   onKeyDown(e) -> if e.key === 'Control' and not already recording -> speechRecognition.start()
//   onKeyUp(e)   -> if e.key === 'Control' -> speechRecognition.stop() -> emits final transcript
