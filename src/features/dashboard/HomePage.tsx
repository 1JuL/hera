import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Compass,
  Bot,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { useDraftResponse } from "../diagnostic/hooks/useDraftResponse";

export const HomePage: React.FC = () => {
  const { draft } = useDraftResponse();

  const answeredCount = useMemo(() => {
    return Object.keys(draft.answers).filter(
      (k) => draft.answers[k] !== undefined && draft.answers[k] !== null && draft.answers[k] !== "",
    ).length;
  }, [draft.answers]);

  const hasDraft = answeredCount > 1;

  return (
    <main className="max-w-[1140px] w-full mx-auto px-4 sm:px-6 py-10 md:py-14 flex-1 flex flex-col justify-center items-center">
      {/* Encabezado Principal Centrado */}
      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#163A2B] font-brand tracking-tight mb-3">
          Bienvenido a Hera
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Plataforma de autodiagnóstico y recomendaciones TIC diseñada para que las microempresas de{" "}
          <strong>Chía, Cajicá y Zipaquirá</strong> descubran qué tecnologías generan valor real en
          sus procesos y cómo aprovecharlas.
        </p>

        {/* Estado amigable del diagnóstico si ya hay respuestas */}
        {hasDraft && (
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#86CEAB] shadow-2xs text-xs text-[#163A2B]">
            <CheckCircle2 className="w-4 h-4 text-[#86CEAB]" />
            <span>
              Tienes un diagnóstico con <strong>{answeredCount} respuestas</strong> registradas.
            </span>
            <Link to="/mapa" className="font-bold underline hover:opacity-80 ml-1 text-[#163A2B]">
              Ver mapa personalizado →
            </Link>
          </div>
        )}
      </div>

      {/* Grid Central de Botones Grandes y Centrados (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-[980px] mx-auto">
        {/* Módulo 1: Carga de Datos y Diagnóstico */}
        <Link
          to="/carga-datos"
          className="bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between min-h-[290px] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-200/80 hover:border-[#86CEAB] no-underline group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E8F5EE] text-[#163A2B] flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-[#163A2B] group-hover:text-white transition-all duration-300">
                <ClipboardCheck className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[11px] font-bold text-[#163A2B] bg-[#E8F5EE] px-3 py-1 rounded-full uppercase tracking-wider">
                Paso 1 · Autodiagnóstico
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#163A2B] transition-colors mb-2 font-brand">
              Cargar Datos & Diagnóstico
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Evalúa la madurez digital de tu negocio, identifica procesos manuales en tus 7 áreas y
              genera tu perfil empresarial descargable en Excel.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              {hasDraft ? "Continuar diagnóstico en curso" : "~10 min · Exportable a Excel"}
            </span>
            <span className="text-xs font-bold text-[#163A2B] flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
              <span>{hasDraft ? "Ver cuestionario" : "Comenzar diagnóstico"}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Módulo 2: Mapa de Oportunidades (Módulo Principal / Destacado) */}
        <Link
          to="/mapa"
          className="bg-[#163A2B] text-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between min-h-[290px] shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 no-underline group relative overflow-hidden border border-[#163A2B]"
        >
          {/* Acento decorativo sutil */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#86CEAB]/15 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 text-[#86CEAB] flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-[#86CEAB] group-hover:text-[#163A2B] transition-all duration-300">
                <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="bg-[#86CEAB] text-[#163A2B] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3" />
                Módulo Principal
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-brand">
              Mapa de Oportunidades
            </h2>

            <p className="text-xs sm:text-sm text-[#D0E6DC] leading-relaxed">
              Explora soluciones TIC organizadas en 9 áreas de tu negocio: opciones de código
              abierto, gratuitas, freemium, bajo costo y herramientas con IA con guías de 3 pasos.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-[#86CEAB] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#86CEAB] inline-block animate-pulse"></span>
              9 Áreas · +40 Soluciones
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
              <span>Explorar soluciones TIC</span>
              <ArrowRight className="w-4 h-4 text-[#86CEAB]" />
            </span>
          </div>
        </Link>

        {/* Módulo 3: Asistente Inteligente */}
        <Link
          to="/asistente"
          className="bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between min-h-[290px] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-200/80 hover:border-purple-300 no-underline group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-purple-700 group-hover:text-white transition-all duration-300">
                <Bot className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Paso 3 · Asesoría
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-purple-900 transition-colors mb-2 font-brand">
              Asistente Conversacional
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Resuelve dudas sobre qué tecnología adoptar, costos y pasos de implementación con
              soporte en lenguaje sencillo y amigable por voz o chat.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Soporte por voz y texto</span>
            <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
              <span>Hablar con el asistente</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Módulo 4: Estadísticas & Métricas */}
        <Link
          to="/estadisticas"
          className="bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between min-h-[290px] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-200/80 hover:border-blue-300 no-underline group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-blue-700 group-hover:text-white transition-all duration-300">
                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Panel Analítico
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors mb-2 font-brand">
              Estadísticas & Reportes
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Consulta tu radar de madurez digital, tus brechas prioritarias y compara el estado de
              tu negocio con las estadísticas de micronegocios DANE EMICRON.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Radar, brechas y comparativas</span>
            <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform">
              <span>Ver estadísticas</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </div>

      {/* Pie informativo de apoyo local y neutralidad */}
      <div className="mt-12 text-center max-w-xl mx-auto text-xs text-gray-500 flex items-center justify-center gap-2">
        <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
        <span>
          Iniciativa académica y abierta de la Universidad de la Sabana · Apoyando el comercio local
          de Sabana Centro
        </span>
      </div>
    </main>
  );
};
