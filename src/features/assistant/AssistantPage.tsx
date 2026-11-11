import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Lightbulb,
  Sparkles,
  Bot,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useDraftResponse } from '@/features/diagnostic/hooks/useDraftResponse';
import { ToolImplementationModal } from '@/features/map/components/ToolImplementationModal';
import { TicTool } from '@/features/map/types';
import { ChatMessage, RecommendedToolRef } from './types';
import { useSpeechAssistant } from './hooks/useSpeechAssistant';
import { askAssistant } from './lib/ragEngine';
import { VoiceOrb } from './components/VoiceOrb';

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens = text.split(
    /(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s)]+|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|`[^`\n]+`)/g
  );
  return tokens.map((token, idx) => {
    const linkMatch = token.match(/^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold underline text-[#163A2B] hover:text-[#0e261c] break-all"
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink className="w-3 h-3 inline shrink-0" />
        </a>
      );
    }
    if (/^https?:\/\/[^\s)]+$/.test(token)) {
      return (
        <a
          key={idx}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold underline text-[#163A2B] hover:text-[#0e261c] break-all"
        >
          <span>{token}</span>
          <ExternalLink className="w-3 h-3 inline shrink-0" />
        </a>
      );
    }
    if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      return (
        <strong key={idx} className="font-bold text-[#163A2B]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic font-semibold text-[#163A2B]">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1 py-0.5 rounded bg-black/5 text-[11px] font-mono text-[#163A2B]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((rawLine, lineIdx) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    const headingMatch = trimmed.match(/^#{1,3}\s+(.*)$/);
    if (headingMatch) {
      return (
        <p key={lineIdx} className={`font-bold text-[#163A2B] ${lineIdx > 0 ? 'mt-2' : ''}`}>
          {renderInlineMarkdown(headingMatch[1])}
        </p>
      );
    }

    const bulletMatch = trimmed.match(/^(?:•|-|\*)\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div key={lineIdx} className={`flex items-start gap-2 ${lineIdx > 0 ? 'mt-1.5' : ''}`}>
          <span className="text-[#163A2B] font-bold leading-relaxed select-none">•</span>
          <span className="flex-1">{renderInlineMarkdown(bulletMatch[1])}</span>
        </div>
      );
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      return (
        <div key={lineIdx} className={`flex items-start gap-2 ${lineIdx > 0 ? 'mt-1.5' : ''}`}>
          <span className="text-[#163A2B] font-bold shrink-0">{numberedMatch[1]}.</span>
          <span className="flex-1">{renderInlineMarkdown(numberedMatch[2])}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className={lineIdx > 0 ? 'mt-1.5' : ''}>
        {renderInlineMarkdown(rawLine)}
      </p>
    );
  });
}

export const AssistantPage: React.FC = () => {
  const location = useLocation();
  const { scores: diagnosticScores } = useDraftResponse();

  const initialGreeting = useMemo<ChatMessage>(() => {
    const text = diagnosticScores
      ? `¡Hola! Soy Hera, tu asistente de transformación digital. Revisé tu diagnóstico (${diagnosticScores.overallIndex}% de madurez). Puedes hablarme usando el micrófono o escribirme qué área o herramienta quieres implementar.`
      : '¡Hola! Soy Hera, tu asistente de transformación digital. Pregúntame por voz o por escrito qué herramienta gratuita, open source o de bajo costo sirve para ventas, contabilidad, inventarios, WhatsApp o envíos.';

    return {
      id: 'welcome',
      sender: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }, [diagnosticScores]);

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputText, setInputText] = useState('');
  const [selectedToolModal, setSelectedToolModal] = useState<{
    tool: TicTool;
    areaTitle: string;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const initialPromptHandledRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submitQuery = useCallback(
    (rawQuery: string, speakFn: (text: string) => void) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [...messagesRef.current, userMsg];
      setMessages(updatedHistory);
      setInputText('');

      const result = askAssistant(trimmed, updatedHistory, diagnosticScores);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: result.text,
        speechText: result.speechText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedTools: result.recommendedTools,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakFn(result.speechText || result.text);
    },
    [diagnosticScores]
  );

  const speakRef = useRef<(text: string, force?: boolean) => void>(() => {});

  const {
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
  } = useSpeechAssistant({
    onFinalTranscript: (transcript) => {
      submitQuery(transcript, (txt) => speakRef.current(txt));
    },
  });

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // Manejar consulta pre-cargada cuando el usuario viene desde el Mapa de Oportunidades
  useEffect(() => {
    const state = location.state as { initialPrompt?: string } | null;
    if (state?.initialPrompt && !initialPromptHandledRef.current) {
      initialPromptHandledRef.current = true;
      submitQuery(state.initialPrompt, (txt) => speak(txt));
    }
  }, [location.state, submitQuery, speak]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    submitQuery(inputText, (txt) => speak(txt));
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([initialGreeting]);
  };

  const quickPrompts = diagnosticScores
    ? [
        '¿Qué áreas debo priorizar según mi diagnóstico?',
        '¿Cómo empiezo con WhatsApp Business?',
        'Necesito una herramienta gratis para inventario',
        '¿Cómo puedo cobrar con tarjeta o Nequi?',
      ]
    : [
        '¿Qué herramienta gratis recomiendas para ventas y fiados?',
        '¿Cómo empiezo con WhatsApp Business?',
        'Opciones para facturación electrónica DIAN',
        'Herramientas con IA para hacer publicidad en redes',
      ];

  return (
    <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Panel Izquierdo: Conversación y Recomendaciones RAG */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-[#E0E0E0] min-h-[580px] max-h-[calc(100vh-120px)]">
          {/* Header del Chat */}
          <div className="border-b border-gray-100 pb-3.5 mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#163A2B] text-[#86CEAB] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E1E1E] font-brand">
                  Asistente Hera
                </h2>
                <p className="text-xs text-[#666666]">
                  Resuelve dudas de implementación y compara opciones TIC sin sesgos
                </p>
              </div>
            </div>

            {/* Controles superiores: Mute y Reiniciar */}
            <div className="flex items-center gap-1.5">
              {ttsSupported && (
                <button
                  type="button"
                  onClick={toggleMute}
                  title={isMuted ? 'Activar voz del asistente' : 'Silenciar voz del asistente'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                    isMuted
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-[#E8F5EE] text-[#163A2B] border-[#86CEAB]/60 hover:bg-[#d4efe0]'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Voz silenciada</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Voz activa</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleResetChat}
                title="Reiniciar conversación"
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border-none cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#163A2B] text-white rounded-br-xs'
                      : 'bg-[#F4F7F5] text-[#1E1E1E] border border-[#E0E7E3] rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        m.sender === 'user' ? 'text-[#86CEAB]' : 'text-[#163A2B]'
                      }`}
                    >
                      {m.sender === 'user' ? 'Tú' : 'Hera'} · {m.timestamp}
                    </span>

                    {m.sender === 'assistant' && ttsSupported && (
                      <button
                        type="button"
                        onClick={() => speak(m.speechText || m.text, true)}
                        title="Escuchar este mensaje"
                        className="text-[#163A2B] hover:opacity-70 bg-transparent border-none cursor-pointer p-0.5 flex items-center gap-1 text-[10px] font-semibold"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Escuchar</span>
                      </button>
                    )}
                  </div>

                  <div className={m.sender === 'user' ? 'text-white [&_strong]:text-[#86CEAB]' : ''}>
                    {renderFormattedText(m.text)}
                  </div>
                </div>

                {/* Tarjetas de herramientas recuperadas por el RAG */}
                {m.sender === 'assistant' &&
                  m.recommendedTools &&
                  m.recommendedTools.length > 0 && (
                    <div className="mt-2.5 w-full max-w-[95%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {m.recommendedTools.map(({ tool, areaTitle }: RecommendedToolRef) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => setSelectedToolModal({ tool, areaTitle })}
                          className="text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-[#163A2B] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold text-[#163A2B] bg-[#E8F5EE] px-2 py-0.5 rounded-md truncate">
                                {areaTitle}
                              </span>
                              {tool.hasAi && (
                                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#163A2B]">
                              {tool.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                              {tool.pricingLabel} · {tool.impactMetric}
                            </p>
                          </div>

                          <span className="mt-2 text-[11px] font-bold text-[#163A2B] flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-500" />
                            Ver guía (3 pasos) →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* Sugerencias rápidas y área de entrada */}
          <div className="pt-3 border-t border-gray-100 space-y-2.5">
            {/* Chips de preguntas frecuentes */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => submitQuery(qp, (txt) => speak(txt))}
                  className="text-[11px] font-medium bg-[#F4F6F4] hover:bg-[#E8F5EE] text-[#163A2B] border border-gray-200 hover:border-[#86CEAB] px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors shrink-0"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Transcripción en vivo cuando habla por micrófono */}
            {interimTranscript && (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-[#163A2B] italic flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
                <span>Escuchando: "{interimTranscript}"...</span>
              </div>
            )}

            {/* Aviso de error o navegador sin soporte de micrófono */}
            {sttError && (
              <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{sttError}</span>
              </div>
            )}

            {!sttSupported && !sttError && (
              <div className="text-[11px] text-gray-500">
                Nota: Tu navegador no soporta dictado por voz. Puedes escribir tus dudas directamente aquí abajo.
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex gap-2 items-center">
              {sttSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Pausar micrófono' : 'Hablar por micrófono'}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              )}

              <input
                type="text"
                placeholder="Escribe tu pregunta o usa el micrófono..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86CEAB] bg-white text-[#1E1E1E]"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-[#163A2B] hover:bg-[#0e261c] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Panel Derecho: Orbe Reactivo a la Voz + Controles de Audio */}
        <div className="flex flex-col">
          <div className="bg-[#163A2B] text-white rounded-2xl p-6 flex-1 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden min-h-[420px]">
            {/* Decoración sutil */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#86CEAB]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            {/* Botón superior de estado de micrófono */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={!sttSupported}
              className="text-xs bg-white/15 hover:bg-white/25 disabled:opacity-50 cursor-pointer py-1.5 px-3.5 rounded-full mb-5 transition-colors select-none flex items-center gap-2 border border-white/10 text-white"
            >
              {isListening ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#86CEAB]" />
                  <span>Micrófono activo</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-gray-300" />
                  <span>{sttSupported ? 'Micrófono en pausa' : 'Solo texto'}</span>
                </>
              )}
            </button>

            {/* Orbe Reactivo Semi-3D (estilo Voice Mode) */}
            <VoiceOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              isMuted={isMuted}
              speechPulse={speechPulse}
              disabled={!sttSupported}
              onClick={() => sttSupported && toggleListening()}
            />

            <h4 className="text-base font-bold text-white mt-1 mb-1 font-brand">
              {isSpeaking
                ? 'Hera está hablando...'
                : isListening
                ? 'Te estoy escuchando'
                : sttSupported
                ? 'Toca el orbe para hablar'
                : 'Modo chat escrito'}
            </h4>
            <p className="text-xs text-[#D0E6DC] max-w-[240px] leading-relaxed mb-6">
              {isSpeaking
                ? 'Escucha la recomendación o silencia la voz en cualquier momento.'
                : isListening
                ? 'Habla con naturalidad en español. Enviaré tu pregunta al terminar la frase.'
                : sttSupported
                ? 'Puedes hablar por voz o escribir tus dudas en el chat de la izquierda.'
                : 'Tu navegador no tiene dictado por voz, pero puedes escribir y escuchar las respuestas.'}
            </p>

            {/* Controles de Voz y Silencio debajo del orbe */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="text-xs font-bold bg-amber-300 hover:bg-amber-200 text-[#163A2B] px-3.5 py-2 rounded-xl border-none cursor-pointer transition-colors"
                >
                  Detener audio
                </button>
              )}

              {ttsSupported && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl border cursor-pointer transition-colors flex items-center gap-1.5 ${
                    isMuted
                      ? 'bg-red-500/20 text-red-200 border-red-400/40 hover:bg-red-500/30'
                      : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Quitar silencio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#86CEAB]" />
                      <span>Mutear respuesta</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {sttError && (
              <div className="mt-4 w-full px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-300/40 text-[11px] text-amber-100 leading-relaxed text-left">
                {sttError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Guía de Implementación de 3 Pasos desde el chat */}
      <ToolImplementationModal
        tool={selectedToolModal?.tool || null}
        areaTitle={selectedToolModal?.areaTitle}
        onClose={() => setSelectedToolModal(null)}
        onAskAssistant={(prompt) => {
          setSelectedToolModal(null);
          submitQuery(prompt, (txt) => speak(txt));
        }}
      />
    </main>
  );
};
