import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square, Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';

export default function ChatInput({ onSendMessage, isTyping, ttsEnabled, onToggleTts }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseInputRef = useRef('');
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState('');

  // Audio input device selection state
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // True only when the user clicked "stop" themselves — lets onend tell the
  // difference between "user stopped me" and "browser/service killed me".
  const userStoppedRef = useRef(false);
  const hasErrorRef = useRef(false);

  // Microphone audio level/volume analyzer state & refs
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Load available audio input devices
  const loadAudioDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter(d => d.kind === 'audioinput');
      setDevices(audioInputs);
      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch (e) {
      console.error('Failed to enumerate audio devices:', e);
    }
  }, [selectedDeviceId]);

  // List devices on mount
  useEffect(() => {
    loadAudioDevices();
  }, [loadAudioDevices]);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setVolume(0);
  }, []);

  const stopRecognitionInstance = useCallback(() => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      // Detach handlers before stopping so a late event from a dying
      // instance can never stomp on state belonging to a newer one.
      rec.onstart = null;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.stop();
      } catch (e) {
        try {
          rec.abort();
        } catch (_) {
          /* already dead, ignore */
        }
      }
      recognitionRef.current = null;
    }
  }, []);

  // Clean up speech recognition & audio analyzer on unmount
  useEffect(() => {
    return () => {
      stopRecognitionInstance();
      stopAudioAnalysis();
    };
  }, [stopRecognitionInstance, stopAudioAnalysis]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const startVolumeMeter = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        setVolume(sum / dataArrayRef.current.length);
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      // Volume bars are cosmetic only — never let this block speech recognition.
      console.error('Volume meter failed to start:', e);
    }
  };

  const stopListening = () => {
    userStoppedRef.current = true;
    stopRecognitionInstance();
    stopAudioAnalysis();
    setIsListening(false);
  };

  const startListening = async () => {
    setMicError('');
    hasErrorRef.current = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Speech recognition isn\u2019t supported in this browser. Try Chrome or Edge.');
      return;
    }

    // Not on https/localhost: getUserMedia and SpeechRecognition are both
    // blocked silently by the browser in this case.
    const isSecure =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!isSecure) {
      setMicError('Voice input needs a secure (https) connection to work.');
      return;
    }

    // Clean up any stray previous instance first.
    stopRecognitionInstance();
    stopAudioAnalysis();

    // Setup constraints with selected device if any
    let constraints = { audio: true };
    if (selectedDeviceId) {
      constraints = { audio: { deviceId: { exact: selectedDeviceId } } };
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error('Mic permission/access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone access was denied. Allow it in your browser\u2019s site settings, then try again.');
      } else if (err.name === 'NotFoundError') {
        setMicError('No microphone was found on this device.');
      } else {
        setMicError(`Couldn\u2019t access the microphone: ${err.message || err.name}`);
      }
      return;
    }

    streamRef.current = stream;
    userStoppedRef.current = false;
    baseInputRef.current = input;

    // Reload devices to populate labels now that permission is granted
    loadAudioDevices();

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      startVolumeMeter(stream);
    };

    rec.onresult = (event) => {
      let finalSpeech = '';
      let interimSpeech = '';

      for (let i = 0; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalSpeech += transcript + ' ';
        } else {
          interimSpeech += transcript;
        }
      }

      const prefix = baseInputRef.current ? baseInputRef.current.trim() + ' ' : '';
      const currentText = finalSpeech + interimSpeech;
      setInput((prefix + currentText).trimStart());
    };

    rec.onerror = (e) => {
      console.error('Speech recognition error event:', e.error);
      hasErrorRef.current = true; // Mark error to prevent hot-restart loops
      
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicError('Microphone access was denied. Allow it in your browser\u2019s site settings, then try again.');
      } else if (e.error === 'audio-capture') {
        setMicError('No microphone found, or it\u2019s being used by another app.');
      } else if (e.error === 'network') {
        setMicError('Speech recognition needs an internet connection.');
      } else if (e.error === 'no-speech' || e.error === 'aborted') {
        // Transient — not worth surfacing as an error.
      } else {
        setMicError(`Speech recognition error: ${e.error}`);
      }
    };

    rec.onend = () => {
      setIsListening(false);
      stopAudioAnalysis();
      recognitionRef.current = null;

      // Chrome/Edge sometimes end the session on their own (silence
      // timeout, ~60s internal cap) even though the user never clicked
      // stop. Auto-restart seamlessly in that case so it doesn't feel
      // like voice input "randomly stops."
      // CRITICAL: Only restart if user didn't stop manually AND there was no error
      if (!userStoppedRef.current && !hasErrorRef.current) {
        setTimeout(() => {
          if (!userStoppedRef.current && !recognitionRef.current) {
            startListening();
          }
        }, 1000);
      }
    };

    try {
      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setMicError(`Couldn\u2019t start voice input: ${err.message || err}`);
      recognitionRef.current = null;
      stopAudioAnalysis();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="max-w-4xl mx-auto relative group">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening... Speak now (click mic again to stop).' : 'Ask a question about your documents...'}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-4 pr-44 py-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none overflow-hidden min-h-[56px] transition-all shadow-sm"
          rows={1}
          disabled={isTyping}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5 h-10">

          {/* Bouncing Audio Volume Bars */}
          {isListening && (
            <div className="flex items-end gap-[3px] h-6 px-1.5 shrink-0 select-none pointer-events-none mb-0.5">
              <span className="w-0.5 bg-red-500 rounded-full transition-all duration-75 ease-out" style={{ height: `${Math.max(4, Math.min(24, volume * 0.10))}px` }} />
              <span className="w-0.5 bg-red-500 rounded-full transition-all duration-75 ease-out" style={{ height: `${Math.max(4, Math.min(24, volume * 0.20))}px` }} />
              <span className="w-0.5 bg-red-500 rounded-full transition-all duration-75 ease-out" style={{ height: `${Math.max(4, Math.min(24, volume * 0.15))}px` }} />
              <span className="w-0.5 bg-red-500 rounded-full transition-all duration-75 ease-out" style={{ height: `${Math.max(4, Math.min(24, volume * 0.25))}px` }} />
              <span className="w-0.5 bg-red-500 rounded-full transition-all duration-75 ease-out" style={{ height: `${Math.max(4, Math.min(24, volume * 0.08))}px` }} />
            </div>
          )}

          {/* Device Selector (Microphone Dropdown) */}
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                if (isListening) {
                  // Restart listening with the new microphone selection immediately
                  stopListening();
                  setTimeout(() => startListening(), 300);
                }
              }}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-primary max-w-[120px] truncate"
              title="Select Microphone Device"
            >
              {devices.map((device, idx) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          {/* Global TTS Toggle */}
          <button
            type="button"
            onClick={onToggleTts}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              ttsEnabled
                ? 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700'
                : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
            }`}
            title={ttsEnabled ? 'Disable Text-to-Speech (Auto-Speak)' : 'Enable Text-to-Speech (Auto-Speak)'}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Mic Speech-to-Text Button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isTyping}
            style={isListening ? { boxShadow: `0 0 ${8 + volume * 0.15}px rgba(239, 68, 68, ${0.4 + volume * 0.002})` } : {}}
            className={`p-2 rounded-lg transition-all cursor-pointer duration-75 ${
              isListening
                ? 'bg-red-500/25 text-red-500 border border-red-500/50'
                : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? 'Stop Listening' : 'Type with Voice (Speech-to-Text)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send / Stop Buttons */}
          {isTyping ? (
            <button className="p-2 bg-zinc-800 text-zinc-400 rounded-lg" disabled>
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {micError && (
        <div className="max-w-4xl mx-auto mt-2 flex items-center gap-1.5 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{micError}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center mt-2">
        <p className="text-[10px] text-muted-foreground">
          AI can make mistakes. Consider verifying important information. Use Shift + Enter for new line.
        </p>
      </div>
    </div>
  );
}
