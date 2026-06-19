export const cleanSpeechText = (text) => {
  if (!text) return '';
  return text
    // 1. Remove code blocks entirely
    .replace(/```[\s\S]*?```/g, '')
    // 2. Remove inline code backticks but keep text
    .replace(/`([^`]+)`/g, '$1')
    // 3. Remove headers formatting (e.g. #, ##)
    .replace(/^\s*#+\s+/gm, '')
    // 4. Remove bold/italics markers but keep text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 5. Remove links markdown syntax but keep anchor text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 6. Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // 7. Remove list bullet marks at the start of lines
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // 8. Clean up extra whitespaces
    .replace(/\s+/g, ' ')
    .trim();
};

export const getNaturalVoice = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  
  // 1. Try to find Google US English (very natural sounding)
  let voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'));
  if (!voice) {
    // 2. Try to find Natural Microsoft or Apple voices
    voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('David')));
  }
  if (!voice) {
    // 3. Try any en-US voice
    voice = voices.find(v => v.lang === 'en-US');
  }
  if (!voice) {
    // 4. Fall back to any English voice
    voice = voices.find(v => v.lang.startsWith('en'));
  }
  return voice;
};

export const speakText = (text, onEndCallback = null, onErrorCallback = null) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  
  window.speechSynthesis.cancel(); // Stop any active reading first
  
  const cleaned = cleanSpeechText(text);
  if (!cleaned) {
    if (onEndCallback) onEndCallback();
    return null;
  }
  
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'en-US';
  utterance.rate = 0.95; // Slightly slower for clear, professional narration
  utterance.pitch = 1.0;
  
  const voice = getNaturalVoice();
  if (voice) {
    utterance.voice = voice;
  }
  
  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };
  
  utterance.onerror = (e) => {
    console.error("SpeechSynthesisUtterance error:", e);
    if (onErrorCallback) onErrorCallback(e);
  };
  
  window.speechSynthesis.speak(utterance);
  return utterance;
};
