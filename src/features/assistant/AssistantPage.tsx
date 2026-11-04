import React, { useState } from 'react';

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'user',
      text: '¿Cómo puedo vender mis productos por WhatsApp?',
    },
    {
      sender: 'assistant',
      text: 'Cree una cuenta de WhatsApp Business, suba fotos y precios de sus productos y comparta el enlace con sus clientes.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(true);
  const [showStepModal, setShowStepModal] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Entendido. Para su tipo de negocio, le recomiendo configurar las respuestas rápidas y vincular su catálogo directamente para agilizar los pedidos.',
        },
      ]);
    }, 600);
  };

  return (
    <main className="max-w-[1200px] w-full mx-auto px-5 py-8 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Panel Izquierdo: Conversación / WhatsApp Business */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 h-[460px] flex flex-col justify-between shadow-sm border border-[#E0E0E0]/60">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-[#1E1E1E]">
                WhatsApp Business
              </h3>
              <span className="text-[11px] bg-[#E8F5EE] text-[#163A2B] font-semibold px-2 py-0.5 rounded">
                Tecnología en foco
              </span>
            </div>
            <p className="text-xs text-[#666666] mb-4">
              Versión gratuita de WhatsApp para negocios.
            </p>

            <div className="bg-[#F9FAF9] border border-[#E0E0E0]/60 p-4 rounded-lg text-[13px] space-y-3 max-h-[240px] overflow-y-auto">
              {messages.map((m, idx) => (
                <div key={idx} className="leading-relaxed">
                  <strong className="text-[#163A2B]">
                    {m.sender === 'user' ? 'Usted:' : 'Asistente Hera:'}
                  </strong>{' '}
                  <span className="text-[#1E1E1E]">{m.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Prefiero escribir... (presiona Enter)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#163A2B] bg-white text-[#1E1E1E]"
              />
              <button
                type="submit"
                className="bg-[#163A2B] hover:bg-[#112D21] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Enviar
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowStepModal(true)}
              className="bg-[#163A2B] hover:bg-[#112D21] text-white py-2.5 px-5 rounded-lg text-xs font-semibold cursor-pointer transition-colors w-full sm:w-auto"
            >
              Ver paso a paso
            </button>
          </div>
        </div>

        {/* Panel Derecho: Orbe reactivo a la voz */}
        <div className="bg-[#163A2B] text-white rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden min-h-[380px]">
          <span
            onClick={() => setIsListening(!isListening)}
            className="text-xs bg-white/20 hover:bg-white/30 cursor-pointer py-1 px-3 rounded-full mb-4 transition-colors select-none"
          >
            {isListening ? '● Escuchando' : '○ En pausa'}
          </span>

          {/* Orbe animado */}
          <div
            onClick={() => setIsListening(!isListening)}
            className={`w-[100px] h-[100px] rounded-full flex items-center justify-center my-4 cursor-pointer transition-transform ${
              isListening
                ? 'bg-[#86CEAB]/25 ring-8 ring-[#86CEAB]/15 animate-pulse'
                : 'bg-white/10'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-[#86CEAB] shadow-[0_0_20px_#86CEAB]'
                  : 'bg-white/40'
              }`}
            />
          </div>

          <h4 className="text-base font-bold text-white mb-1">
            {isListening ? 'Le estoy escuchando' : 'Micrófono en pausa'}
          </h4>
          <p className="text-xs text-white/80 max-w-[220px]">
            {isListening
              ? 'Hable con normalidad, yo le respondo.'
              : 'Haz clic en el orbe o en el botón superior para reactivar la voz.'}
          </p>
        </div>
      </div>

      {/* Modal / Vista Paso a Paso */}
      {showStepModal && (
        <div
          onClick={() => setShowStepModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-[460px] p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowStepModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F0F0F0] text-[#666] font-bold flex items-center justify-center border-none cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-[#163A2B] mb-2">
              Guía paso a paso: WhatsApp Business
            </h3>
            <p className="text-xs text-[#666666] mb-4">
              Siga estos sencillos pasos para iniciar sus ventas digitales:
            </p>
            <ol className="list-decimal pl-5 text-xs text-[#1E1E1E] space-y-2.5">
              <li>
                <strong>Descargue la aplicación</strong> desde Google Play Store o App Store.
              </li>
              <li>
                <strong>Verifique su número</strong> comercial y complete la información de perfil (nombre, categoría, horario).
              </li>
              <li>
                <strong>Cree su catálogo:</strong> Suba fotos, precios y descripciones breves de sus productos principales.
              </li>
              <li>
                <strong>Comparta su enlace:</strong> Envíe el enlace directo de su perfil o compártalo en sus redes sociales.
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowStepModal(false)}
              className="w-full mt-6 bg-[#163A2B] hover:bg-[#112D21] text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

