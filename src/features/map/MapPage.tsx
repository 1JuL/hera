import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Sparkles,
  ClipboardCheck,
  Lightbulb,
  X,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { AREAS_DATA } from "./data/areas";
import { Area, TicTool } from "./types";
import { getPricingBadge } from "./ui";
import { AreaCard } from "./components/AreaCard";
import { AreaDetailModal } from "./components/AreaDetailModal";
import { ToolImplementationModal } from "./components/ToolImplementationModal";
import { useDraftResponse } from "../diagnostic/hooks/useDraftResponse";

export const MapPage: React.FC = () => {
  const { scores } = useDraftResponse();

  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedTool, setSelectedTool] = useState<{
    tool: TicTool;
    areaTitle: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showOnlyPriority, setShowOnlyPriority] = useState(false);

  const areasList = useMemo(() => Object.values(AREAS_DATA), []);

  const diagnosticAnalysis = useMemo(() => {
    if (!scores) {
      return { hasDiagnostic: false, priorityAreas: new Set<string>(), totalGaps: 0 };
    }

    const prioritySet = new Set<string>(scores.priorityGaps.map((g) => g.areaId));

    // Si no hay brechas explícitas pero madurez baja (< 50) e importancia alta (>= 4)
    for (const [aId, aScore] of Object.entries(scores.areas)) {
      if (aScore.importance >= 4 && aScore.maturityScore < 50) {
        prioritySet.add(aId);
      }
    }

    return {
      hasDiagnostic: true,
      priorityAreas: prioritySet,
      totalGaps: scores.priorityGaps.length,
    };
  }, [scores]);

  // Colección de todas las herramientas TIC para búsqueda transversal
  const allToolsWithArea = useMemo(() => {
    const list: { tool: TicTool; area: Area }[] = [];
    for (const area of areasList) {
      for (const tool of area.tools) {
        list.push({ tool, area });
      }
    }
    return list;
  }, [areasList]);

  // Filtrado de herramientas por búsqueda y categoría global
  const filteredToolsGlobal = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query && activeFilter === "all") return [];

    return allToolsWithArea.filter(({ tool, area }) => {
      // Filtro por tipo
      if (activeFilter === "ai" && !tool.hasAi) return false;
      if (activeFilter === "open_source" && tool.pricingType !== "open_source") return false;
      if (activeFilter === "free" && tool.pricingType !== "free") return false;
      if (activeFilter === "freemium" && tool.pricingType !== "freemium") return false;
      if (activeFilter === "paid" && tool.pricingType !== "paid_low_cost") return false;

      // Filtro por texto
      if (!query) return true;

      const inName = tool.name.toLowerCase().includes(query);
      const inCategory = tool.category.toLowerCase().includes(query);
      const inDesc = tool.shortDesc.toLowerCase().includes(query);
      const inBenefit = tool.concreteBenefit.toLowerCase().includes(query);
      const inProblem = tool.problemSolved.toLowerCase().includes(query);
      const inArea =
        area.title.toLowerCase().includes(query) || area.code.toLowerCase().includes(query);

      return inName || inCategory || inDesc || inBenefit || inProblem || inArea;
    });
  }, [allToolsWithArea, searchQuery, activeFilter]);

  // Áreas visibles en el grid principal
  const visibleAreas = useMemo(() => {
    if (showOnlyPriority && diagnosticAnalysis.hasDiagnostic) {
      return areasList.filter((a) => diagnosticAnalysis.priorityAreas.has(a.id));
    }
    return areasList;
  }, [areasList, showOnlyPriority, diagnosticAnalysis]);

  const isSearchOrFilterActive = searchQuery.trim().length > 0 || activeFilter !== "all";

  return (
    <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 flex-1">
      {/* Encabezado Principal del Mapa */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#163A2B] font-brand tracking-tight">
            Mapa de Oportunidades TIC
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Recomendaciones curadas de herramientas tecnológicas organizadas en{" "}
            <strong>9 áreas clave</strong> para tu negocio. Explora opciones de código abierto,
            gratuitas, freemium y con IA para digitalizar cada proceso sin sesgos comerciales.
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-[#163A2B] bg-[#E8F5EE] border border-[#86CEAB]/60 px-3.5 py-2 rounded-xl inline-block shadow-2xs">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider">
              Catálogo Abierto
            </span>
            <span>
              {areasList.length} ÁREAS · {allToolsWithArea.length} SOLUCIONES TIC
            </span>
          </div>
        </div>
      </div>

      {/* Banner de Diagnóstico (Personalización) */}
      {diagnosticAnalysis.hasDiagnostic ? (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#E8F5EE] border border-[#86CEAB] text-[#163A2B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#163A2B] text-[#86CEAB] flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#163A2B]">
                Recomendaciones personalizadas según tu diagnóstico
              </h3>
              <p className="text-xs text-[#0e261c] opacity-90 mt-0.5">
                Detectamos oportunidades prioritarias en{" "}
                <strong>{diagnosticAnalysis.priorityAreas.size} áreas</strong> de tu empresa. Las
                áreas con procesos manuales tienen un marco verde destacado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowOnlyPriority(!showOnlyPriority)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-colors border ${
                showOnlyPriority
                  ? "bg-[#163A2B] text-white border-[#163A2B]"
                  : "bg-white text-[#163A2B] hover:bg-white/80 border-[#86CEAB]"
              }`}
            >
              {showOnlyPriority ? "Ver todas las 7 áreas" : "Filtrar mis áreas prioritarias"}
            </button>
            <Link
              to="/estadisticas"
              className="text-xs font-semibold text-[#163A2B] hover:underline px-2 py-1 no-underline"
            >
              Ver análisis →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-white border border-gray-200 text-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-[#163A2B]" />
            </div>
            <div>
              <p className="text-xs text-gray-800">
                <strong>¿Quieres ver qué herramientas resolverán tus procesos manuales?</strong>{" "}
                Realiza el autodiagnóstico guiado para que el mapa resalte automáticamente las áreas
                prioritarias de tu empresa.
              </p>
            </div>
          </div>

          <Link
            to="/carga-datos"
            className="text-xs font-bold bg-[#163A2B] hover:bg-[#0e261c] text-white px-4 py-2 rounded-xl transition-colors no-underline shrink-0 text-center"
          >
            Hacer autodiagnóstico (~10 min) →
          </Link>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros Transversales */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 mb-6 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Campo de búsqueda */}
          <div className="relative w-full flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por herramienta o necesidad (ej. 'whatsapp', 'factura', 'crm', 'ia', 'inventario', 'nómina')..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#86CEAB] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtros rápidos por botones */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer border ${
                activeFilter === "all"
                  ? "bg-[#163A2B] text-white border-[#163A2B]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent"
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("ai")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer border flex items-center gap-1 ${
                activeFilter === "ai"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              Con IA
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("open_source")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer border ${
                activeFilter === "open_source"
                  ? "bg-purple-700 text-white border-purple-700"
                  : "bg-purple-50 text-purple-900 hover:bg-purple-100 border-purple-200"
              }`}
            >
              Open Source
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("free")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer border ${
                activeFilter === "free"
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-200"
              }`}
            >
              100% Gratis
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("freemium")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer border ${
                activeFilter === "freemium"
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200"
              }`}
            >
              Freemium
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("paid")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer border ${
                activeFilter === "paid"
                  ? "bg-amber-700 text-white border-amber-700"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200"
              }`}
            >
              Bajo Costo
            </button>
          </div>
        </div>

        {/* Indicador de estado de búsqueda */}
        {isSearchOrFilterActive && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Mostrando <strong>{filteredToolsGlobal.length}</strong> herramientas encontradas.
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="text-xs text-[#163A2B] font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Si hay búsqueda o filtro activo: Vista de Resultados de Herramientas Directas */}
      {isSearchOrFilterActive ? (
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 font-brand">
              Resultados de la búsqueda ({filteredToolsGlobal.length})
            </h2>
          </div>

          {filteredToolsGlobal.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-800">
                No encontramos herramientas con ese criterio
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Prueba buscando términos generales como "whatsapp", "ventas", "factura", "nube",
                "ia", o explora las 7 áreas directamente.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="mt-4 text-xs font-bold text-white bg-[#163A2B] px-4 py-2 rounded-xl hover:bg-[#0e261c] cursor-pointer"
              >
                Ver todas las áreas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredToolsGlobal.map(({ tool, area }) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#86CEAB] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#163A2B] bg-[#E8F5EE] px-2 py-0.5 rounded-md">
                        {area.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPricingBadge(
                          tool.pricingType,
                        )}`}
                      >
                        {tool.pricingLabel}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">{tool.name}</h3>
                    <p className="text-xs text-gray-500 mb-2.5">{tool.category}</p>

                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{tool.shortDesc}</p>

                    <div className="bg-[#E8F5EE] p-2.5 rounded-lg border border-[#86CEAB]/40 text-xs text-[#0e261c] mb-3">
                      <span className="font-bold block text-[11px] text-[#163A2B] mb-0.5">
                        Beneficio clave:
                      </span>
                      {tool.concreteBenefit}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-500">{tool.difficulty}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTool({
                          tool,
                          areaTitle: area.title,
                        })
                      }
                      className="text-xs font-bold text-white bg-[#163A2B] hover:bg-[#0e261c] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-300" />
                      <span>Guía (3 pasos)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Grid de las 7 Áreas del Diagnóstico */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-brand">
            {showOnlyPriority
              ? `Mis Áreas Prioritarias (${visibleAreas.length})`
              : "Las 9 Áreas Empresariales de Sabana Centro"}
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Haz clic en un área para desplegar todas sus herramientas y guías
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleAreas.map((area) => (
            <AreaCard
              key={area.id}
              area={area}
              isPriority={diagnosticAnalysis.priorityAreas.has(area.id)}
              onSelect={(selected) => setSelectedArea(selected)}
            />
          ))}
        </div>
      </div>

      {/* Modal interactivo de Detalle del Área (Lista completa de herramientas) */}
      <AreaDetailModal
        area={selectedArea}
        onClose={() => setSelectedArea(null)}
        onSelectTool={(tool) => {
          if (selectedArea) {
            setSelectedTool({ tool, areaTitle: selectedArea.title });
          }
        }}
      />

      {/* Modal interactivo de Implementación de la Herramienta (3 Pasos) */}
      <ToolImplementationModal
        tool={selectedTool?.tool || null}
        areaTitle={selectedTool?.areaTitle}
        onClose={() => setSelectedTool(null)}
      />

      {/* Pie informativo sobre neutralidad y soporte humano */}
      <div className="mt-12 p-6 rounded-2xl bg-white border border-gray-200 text-center max-w-3xl mx-auto shadow-2xs">
        <h3 className="text-sm font-bold text-[#163A2B] uppercase tracking-wider mb-1">
          Compromiso de Neutralidad Tecnológica
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Hera es un proyecto de investigación y diseño de la Universidad de la Sabana (grupo
          Senzaccento). No vendemos software, no recibimos comisiones ni promovemos marcas
          exclusivas. Nuestro único objetivo es dar opciones transparentes para que las MiPymes de
          Chía, Cajicá y Zipaquirá aprovechen las TIC y mejoren su productividad.
        </p>
      </div>
    </main>
  );
};
