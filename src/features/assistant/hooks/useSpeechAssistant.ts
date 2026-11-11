import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

function getSpeechRecognitionConstructor(): (new () => ISpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as Record<string, any>;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[•▪◦]/g, '. ')
    .replace(/\n+/g, '. ')
    .trim();
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const nameLower = voice.name.toLowerCase();
  const langLower = voice.lang.toLowerCase();
  let score = 0;

  if (langLower === 'es-co') score += 50;
  else if (langLower === 'es-419' || langLower === 'es-mx') score += 45;
  else if (langLower === 'es-us' || langLower === 'es-es') score += 40;
  else if (langLower.startsWith('es')) score += 30;

  if (
    nameLower.includes('google') ||
    nameLower.includes('natural') ||
    nameLower.includes('neural') ||
    nameLower.includes('online')
  ) {
    score += 40;
  }

  if (nameLower.includes('espeak') || nameLower.includes('mbrola')) {
    score -= 30;
  }

  if (!voice.localService) {
    score += 10;
  }

  return score;
}

function getBestSpanishBrowserVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  const all = window.speechSynthesis.getVoices();
  const spanish = all.filter((v) => v.lang.toLowerCase().startsWith('es'));
  const pool = spanish.length > 0 ? spanish : all;
  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

function detachRecognition(rec: ISpeechRecognition | null) {
  if (!rec) return;
  rec.onstart = null;
  rec.onresult = null;
  rec.onerror = null;
  rec.onend = null;
  try {
    rec.abort();
  } catch {
    // Ignorar si ya fue detenido
  }
}

interface UseSpeechAssistantOptions {
  onFinalTranscript: (transcript: string) => void;
}

export function useSpeechAssistant({ onFinalTranscript }: UseSpeechAssistantOptions) {
  const [sttSupported] = useState<boolean>(() => Boolean(getSpeechRecognitionConstructor()));
  const [ttsSupported] = useState<boolean>(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechPulse, setSpeechPulse] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [sttError, setSttError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const manualStopRef = useRef(false);
  const fatalErrorRef = useRef(false);
  const didStartRef = useRef(false);
  const hadResultRef = useRef(false);
  const startedAtRef = useRef(0);
  const quickEndRetriesRef = useRef(0);
  const restartTimerRef = useRef<number | null>(null);
  const speakTimerRef = useRef<number | null>(null);
  const speakRequestIdRef = useRef(0);
  const onFinalRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  // Pre-cargar voces del navegador
  useEffect(() => {
    if (!ttsSupported) return;
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, [ttsSupported]);

  const startFreshSession = useCallback(() => {
    const SpeechRec = getSpeechRecognitionConstructor();
    if (!SpeechRec) return;

    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    detachRecognition(recognitionRef.current);

    const rec = new SpeechRec();
    rec.lang = 'es-CO';
    rec.continuous = true;
    rec.interimResults = true;

    didStartRef.current = false;
    hadResultRef.current = false;
    fatalErrorRef.current = false;
    startedAtRef.current = Date.now();

    rec.onstart = () => {
      didStartRef.current = true;
      setIsListening(true);
      setSttError(null);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      hadResultRef.current = true;
      quickEndRetriesRef.current = 0;

      let interim = '';
      let finalStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0]?.transcript || '';
        if (res.isFinal) {
          finalStr += text + ' ';
        } else {
          interim += text;
        }
      }

      setInterimTranscript(interim.trim());

      if (finalStr.trim()) {
        setInterimTranscript('');
        onFinalRef.current(finalStr.trim());
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        fatalErrorRef.current = true;
        shouldListenRef.current = false;
        setIsListening(false);
        setSttError(
          'Permiso de micrófono o servicio de voz bloqueado por el navegador. Habilita el micrófono o escribe en el chat.'
        );
      } else if (event.error === 'audio-capture') {
        fatalErrorRef.current = true;
        shouldListenRef.current = false;
        setIsListening(false);
        setSttError(
          'No se detectó un micrófono disponible en el sistema. Revisa tu dispositivo de entrada de audio.'
        );
      } else if (event.error === 'network') {
        fatalErrorRef.current = true;
        shouldListenRef.current = false;
        setIsListening(false);
        setSttError(
          'El navegador bloqueó o no pudo acceder al servicio de voz en la nube (en Brave viene desactivado por defecto; funciona en Chrome/Edge o por chat escrito).'
        );
      } else if (event.error !== 'aborted') {
        fatalErrorRef.current = true;
        shouldListenRef.current = false;
        setIsListening(false);
        setSttError(`No se pudo iniciar el dictado (${event.error}). Puedes escribir abajo.`);
      }
    };

    rec.onend = () => {
      if (recognitionRef.current !== rec) return;

      setIsListening(false);
      setInterimTranscript('');

      if (
        fatalErrorRef.current ||
        manualStopRef.current ||
        !shouldListenRef.current ||
        isSpeakingRef.current
      ) {
        return;
      }

      const elapsed = Date.now() - startedAtRef.current;
      if (!didStartRef.current || (!hadResultRef.current && elapsed < 800)) {
        quickEndRetriesRef.current += 1;
        if (!didStartRef.current || quickEndRetriesRef.current >= 2) {
          shouldListenRef.current = false;
          setSttError(
            'El reconocimiento de voz se detuvo al instante. Si usas Brave (en Linux/Windows), bloquea el servicio Web Speech de Chromium por privacidad; usa Chrome/Edge o escribe tu consulta.'
          );
          return;
        }
      } else {
        quickEndRetriesRef.current = 0;
      }

      restartTimerRef.current = window.setTimeout(() => {
        if (shouldListenRef.current && !isSpeakingRef.current && !manualStopRef.current) {
          startFreshSession();
        }
      }, 250);
    };

    recognitionRef.current = rec;

    try {
      rec.start();
    } catch {
      fatalErrorRef.current = true;
      shouldListenRef.current = false;
      setIsListening(false);
      setSttError('No fue posible activar el micrófono en este navegador. Puedes escribir abajo.');
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    speakRequestIdRef.current += 1;
    if (speakTimerRef.current !== null) {
      window.clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    if (ttsSupported) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, [ttsSupported]);

  const startListening = useCallback(() => {
    if (!sttSupported) {
      setSttError('Tu navegador no soporta dictado por voz. Usa Chrome/Edge o escribe en el chat.');
      return;
    }

    if (isSpeakingRef.current) {
      stopSpeaking();
    }

    setSttError(null);
    manualStopRef.current = false;
    shouldListenRef.current = true;
    quickEndRetriesRef.current = 0;

    startFreshSession();
  }, [sttSupported, stopSpeaking, startFreshSession]);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    shouldListenRef.current = false;
    setIsListening(false);
    setInterimTranscript('');

    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignorar si ya está detenido
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening || shouldListenRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resumeMicAfterSpeech = useCallback(() => {
    if (shouldListenRef.current) {
      manualStopRef.current = false;
      restartTimerRef.current = window.setTimeout(() => {
        if (shouldListenRef.current && !isSpeakingRef.current) {
          startFreshSession();
        }
      }, 300);
    }
  }, [startFreshSession]);

  const speak = useCallback(
    (rawText: string, forceSpeak = false) => {
      if (!ttsSupported || (isMuted && !forceSpeak)) return;

      const textToRead = cleanTextForSpeech(rawText);
      if (!textToRead) return;

      const requestId = speakRequestIdRef.current + 1;
      speakRequestIdRef.current = requestId;

      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }

      // Pausar temporalmente el micrófono para que el agente no se escuche a sí mismo
      if (shouldListenRef.current && recognitionRef.current) {
        manualStopRef.current = true;
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignorar
        }
      }

      const wasSpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending;
      window.speechSynthesis.cancel();

      const startUtterance = () => {
        if (requestId !== speakRequestIdRef.current) return;

        const utterance = new SpeechSynthesisUtterance(textToRead);
        const bestVoice = getBestSpanishBrowserVoice();

        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang;
        } else {
          utterance.lang = 'es-CO';
        }

        utterance.rate = 1.02;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          if (requestId !== speakRequestIdRef.current) return;
          isSpeakingRef.current = true;
          setIsSpeaking(true);
          setSpeechPulse((p) => p + 1);
        };

        utterance.onboundary = () => {
          setSpeechPulse((p) => p + 1);
        };

        const handleFinish = () => {
          if (requestId !== speakRequestIdRef.current) return;
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          resumeMicAfterSpeech();
        };

        utterance.onend = handleFinish;
        utterance.onerror = handleFinish;

        window.speechSynthesis.speak(utterance);
      };

      if (wasSpeaking) {
        speakTimerRef.current = window.setTimeout(startUtterance, 50);
      } else {
        startUtterance();
      }
    },
    [ttsSupported, isMuted, resumeMicAfterSpeech]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      shouldListenRef.current = false;
      speakRequestIdRef.current += 1;
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current);
      }
      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
      }
      detachRecognition(recognitionRef.current);
      recognitionRef.current = null;
      if (ttsSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [ttsSupported]);

  return {
    sttSupported,
    ttsSupported,
    isListening,
    isSpeaking,
    isMuted,
    speechPulse,
    interimTranscript,
    sttError,
    toggleListening,
    speak,
    stopSpeaking,
    toggleMute,
  };
}
