import { AREAS_DATA } from '@/features/map/data/areas';
import { Area } from '@/features/map/types';
import { DiagnosticScores } from '@/features/diagnostic/schema/types';
import { ChatMessage, RecommendedToolRef } from '../types';

const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'a', 'al',
  'en', 'con', 'por', 'para', 'y', 'o', 'u', 'que', 'como', 'cual', 'cuales',
  'quien', 'donde', 'cuando', 'cuanto', 'mi', 'tu', 'su', 'mis', 'tus', 'sus',
  'me', 'te', 'se', 'nos', 'le', 'les', 'lo', 'es', 'son', 'soy', 'esta', 'estan',
  'hay', 'tengo', 'tener', 'quiero', 'queremos', 'puedo', 'podemos', 'necesito',
  'hacer', 'usar', 'implementar', 'herramienta', 'herramientas', 'negocio', 'empresa',
  'area', 'mas', 'muy', 'pero', 'si', 'no', 'ya', 'sobre', 'hola', 'buenos', 'dias',
]);

// Mapa de sinónimos y lenguaje cotidiano de emprendedores colombianos -> términos y áreas del catálogo
const SYNONYM_MAP: Record<string, string[]> = {
  fiado: ['treinta', 'ven', 'cobros', 'deudas'],
  fiados: ['treinta', 'ven', 'cobros', 'deudas'],
  '30': ['treinta'],
  cuaderno: ['treinta', 'excel', 'sheets', 'registro'],
  datafono: ['bold', 'wompi', 'tarjetas', 'ven', 'tec'],
  tarjeta: ['bold', 'wompi', 'pagos'],
  tarjetas: ['bold', 'wompi', 'pagos'],
  nequi: ['bold', 'wompi', 'treinta', 'transferencia'],
  daviplata: ['bold', 'wompi', 'transferencia'],
  pse: ['bold', 'wompi', 'tiendanube'],
  cotizacion: ['hubspot', 'odoo', 'crm', 'ven'],
  cotizaciones: ['hubspot', 'odoo', 'crm', 'ven'],
  prospectos: ['hubspot', 'odoo', 'crm'],
  citas: ['cal.com', 'agendamiento', 'reservas'],
  agenda: ['cal.com', 'agendamiento', 'reservas'],
  tienda: ['tiendanube', 'treinta', 'ecommerce', 'virtual'],
  ecommerce: ['tiendanube', 'tienda', 'online'],
  redes: ['meta business', 'canva', 'capcut', 'mkt'],
  instagram: ['meta business', 'manychat', 'capcut', 'canva', 'mkt'],
  facebook: ['meta business', 'canva', 'mkt'],
  tiktok: ['capcut', 'video', 'reels'],
  publicidad: ['canva', 'chatgpt', 'brevo', 'mkt'],
  diseno: ['canva', 'piezas', 'afiches'],
  logo: ['canva'],
  videos: ['capcut', 'reels'],
  mapa: ['google perfil', 'google maps', 'ubicacion'],
  maps: ['google perfil', 'google maps'],
  // Finanzas y Contabilidad
  finanzas: ['fin', 'contabilidad', 'flujo', 'caja', 'gastos', 'wave', 'gnucash', 'sheets'],
  financiera: ['fin', 'contabilidad', 'flujo', 'wave', 'gnucash'],
  financiero: ['fin', 'contabilidad', 'flujo', 'wave', 'gnucash'],
  contable: ['fin', 'contabilidad', 'alegra', 'siigo', 'gnucash', 'wave'],
  dinero: ['fin', 'ven', 'flujo', 'caja', 'treinta'],
  plata: ['fin', 'ven', 'flujo', 'caja', 'treinta'],
  dian: ['alegra', 'siigo', 'facturacion', 'nomina', 'fin'],
  factura: ['alegra', 'siigo', 'facturacion', 'fin'],
  facturacion: ['alegra', 'siigo', 'fin'],
  contabilidad: ['alegra', 'siigo', 'gnucash', 'wave', 'fin'],
  contador: ['siigo', 'alegra', 'adobe scan'],
  impuestos: ['alegra', 'siigo', 'fin'],
  gastos: ['treinta', 'wave', 'gnucash', 'flujo de caja', 'fin'],
  caja: ['flujo de caja', 'treinta', 'fin'],
  // Ventas, Marketing, Personal, Operaciones, Clientes, Admin, Logística, Tecnología
  ventas: ['ven', 'vender', 'cobros', 'treinta', 'hubspot', 'datafono'],
  vender: ['ven', 'tiendanube', 'treinta', 'whatsapp business'],
  marketing: ['mkt', 'publicidad', 'redes', 'canva', 'meta business'],
  mercadeo: ['mkt', 'publicidad', 'redes', 'canva', 'meta business'],
  empleados: ['clockify', 'trello', 'alegra nomina', 'slack', 'rrh'],
  personal: ['clockify', 'trello', 'alegra nomina', 'slack', 'rrh'],
  turnos: ['clockify', 'trello', 'rrh'],
  nomina: ['alegra nomina', 'nominaapp', 'rrh'],
  tareas: ['trello', 'rrh'],
  operaciones: ['ope', 'inventario', 'bodega', 'produccion', 'sortly', 'erpnext'],
  inventario: ['sortly', 'treinta inventario', 'erpnext', 'ope'],
  inventarios: ['sortly', 'treinta inventario', 'erpnext', 'ope'],
  bodega: ['sortly', 'erpnext', 'appsheet', 'ope'],
  stock: ['sortly', 'treinta inventario', 'ope'],
  produccion: ['erpnext', 'appsheet', 'ope'],
  manufactura: ['erpnext', 'ope'],
  servicio: ['cli', 'cliente', 'clientes', 'whatsapp business', 'chatwoot', 'tally'],
  cliente: ['cli', 'whatsapp business', 'chatwoot', 'manychat', 'tally'],
  clientes: ['cli', 'whatsapp business', 'chatwoot', 'manychat', 'tally'],
  whatsapp: ['whatsapp business', 'chatwoot', 'manychat', 'cli'],
  chatbot: ['manychat', 'chatwoot', 'cli'],
  quejas: ['tally', 'pqrs', 'encuestas', 'cli'],
  pqrs: ['tally', 'encuestas', 'cli'],
  encuesta: ['tally', 'cli'],
  administracion: ['adm', 'seguridad', 'bitwarden', 'google drive', 'nextcloud', 'docusign'],
  administrativa: ['adm', 'seguridad', 'documentos', 'bitwarden'],
  claves: ['bitwarden', 'contrasenas', 'adm'],
  contrasenas: ['bitwarden', 'adm'],
  seguridad: ['bitwarden', 'nextcloud', 'tailscale', 'adm'],
  respaldo: ['google drive', 'nextcloud', 'adm'],
  copia: ['google drive', 'nextcloud', 'adm'],
  nube: ['google drive', 'nextcloud', 'adm'],
  escanear: ['adobe scan', 'recibos', 'adm'],
  recibos: ['adobe scan', 'adm'],
  firma: ['docusign', 'libresign', 'contratos', 'adm'],
  contrato: ['docusign', 'libresign', 'adm'],
  logistica: ['log', 'envioclick', 'mensajeros urbanos', 'circuit', 'openboxes'],
  domicilio: ['mensajeros urbanos', 'circuit', 'log'],
  domicilios: ['mensajeros urbanos', 'circuit', 'log'],
  envio: ['envioclick', 'mensajeros urbanos', 'openboxes', 'log'],
  envios: ['envioclick', 'mensajeros urbanos', 'openboxes', 'log'],
  rutas: ['circuit', 'log'],
  repartidor: ['circuit', 'mensajeros urbanos', 'log'],
  mensajero: ['mensajeros urbanos', 'log'],
  tecnologia: ['tec', 'speedtest', 'rustdesk', 'tailscale', 'libre hardware monitor'],
  wifi: ['speedtest', 'wi-fi', 'tec'],
  internet: ['speedtest', 'wi-fi', 'tec'],
  computador: ['rustdesk', 'libre hardware monitor', 'tailscale', 'tec'],
  soporte: ['rustdesk', 'tec'],
  remoto: ['rustdesk', 'tailscale', 'tec'],
  gratis: ['free', 'open_source', 'gratuito'],
  gratuito: ['free', 'open_source', 'gratis'],
  gratuita: ['free', 'open_source', 'gratis'],
  barato: ['paid_low_cost', 'freemium', 'economico'],
  economico: ['paid_low_cost', 'freemium', 'gratis'],
  libre: ['open_source', 'codigo abierto'],
  ia: ['inteligencia artificial', 'chatgpt', 'manychat', 'canva', 'capcut', 'alegra'],
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasWord(haystack: string, word: string): boolean {
  if (!word) return false;
  return new RegExp(`\\b${escapeRegExp(word)}\\b`).test(haystack);
}

const VOICE_PHONETIC_ALIASES: [RegExp, string][] = [
  [/\b(?:erp\s+next|rp\s*next|r\s*p\s*next|herp\s*next)\b/g, 'erpnext'],
  [/\bsigo\b/g, 'siigo'],
  [/\b30\b/g, 'treinta'],
  [/\btienda\s+nube\b/g, 'tiendanube'],
  [/\bchat\s+gpt\b/g, 'chatgpt'],
  [/\bhub\s+spot\b/g, 'hubspot'],
  [/\bchat\s+woot\b/g, 'chatwoot'],
  [/\bmany\s+chat\b/g, 'manychat'],
  [/\bbit\s+warden\b/g, 'bitwarden'],
  [/\bdocu\s+sign\b/g, 'docusign'],
  [/\blibre\s+sign\b/g, 'libresign'],
  [/\bnext\s+cloud\b/g, 'nextcloud'],
  [/\bapp\s+sheet\b/g, 'appsheet'],
  [/\bcap\s+cut\b/g, 'capcut'],
  [/\bopen\s+boxes\b/g, 'openboxes'],
  [/\bclock\s+ify\b/g, 'clockify'],
  [/\benvio\s+click\b/g, 'envioclick'],
  [/\brust\s+desk\b/g, 'rustdesk'],
  [/\btail\s+scale\b/g, 'tailscale'],
  [/\bspeed\s+test\b/g, 'speedtest'],
  [/\bgnu\s+cash\b/g, 'gnucash'],
  [/\bnomina\s+app\b/g, 'nominaapp'],
];

function normalizeText(text: string): string {
  let normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.\s-]/g, ' ');

  for (const [pattern, replacement] of VOICE_PHONETIC_ALIASES) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

function tokenize(text: string): string[] {
  const norm = normalizeText(text);
  const rawTokens = norm.split(/\s+/).filter((t) => t.length > 1 && !STOPWORDS.has(t));
  const expanded = new Set<string>(rawTokens);

  for (const tok of rawTokens) {
    const syns = SYNONYM_MAP[tok];
    if (syns) {
      for (const s of syns) {
        expanded.add(normalizeText(s).trim());
      }
    }
  }
  return Array.from(expanded);
}

export interface RetrievalResult {
  topTools: RecommendedToolRef[];
  topAreas: Area[];
  intent:
    | 'greeting'
    | 'diagnostic_review'
    | 'implementation_guide'
    | 'support_channel'
    | 'recommendation'
    | 'out_of_scope';
  wantsFreeOnly: boolean;
  wantsOpenSource: boolean;
  wantsAi: boolean;
  contextPrompt: string;
}

const OUT_OF_SCOPE_PATTERNS = [
  /\b(clima|temperatura|lluvia|pronostico|futbol|partido|mundial|gol|nba|tenis|horoscopo|signo zodiacal|politica|elecciones|presidente|novela|pelicula|serie|netflix|anime|cancion|musica|letra|chiste|adivinanza|poema|cuento|historia|geografia|matematicas|ecuacion|derivada|integral|fotosintesis|tarea del colegio|codigo en python|programa en|javascript|java|c\+\+|html|css|medicina|sintomas|dolor de cabeza|enfermedad|dieta|gimnasio|amor|pareja|novia|novio|viaje|vuelo|hotel)\b/i,
  /\b(receta|recetas|cocinar|hornear|ingredientes|brownie|brownies|torta|pastel|almuerzo|cena|desayuno|sopa|arroz|pollo|postre|galletas)\b/i,
  /\b(ignora tus instrucciones|olvida tus reglas|olvida las instrucciones|actua como|finge ser|jailbreak|system prompt)\b/i,
];

const EXPLICIT_BUSINESS_CONTEXT_PATTERN =
  /\b(negocio|empresa|emprendimiento|pyme|mipyme|comercio|tienda|local|fabrica|taller|herramienta|herramientas|software|app|aplicacion|programa|plataforma|sistema|digital|digitalizar|tic|crm|pos|erp|inventario|inventarios|ventas|vender|finanzas|contabilidad|facturacion|marketing|clientes|nomina|logistica|envios|domicilios|diagnostico)\b/i;

const GREETING_PATTERNS = [
  /^(hola|buenos dias|buenas tardes|buenas noches|hey|saludos|que tal|como estas)[!.,\s]*$/i,
];

export function retrieveRelevantContext(
  query: string,
  diagnosticScores: DiagnosticScores | null,
  history: ChatMessage[] = []
): RetrievalResult {
  const normQuery = normalizeText(query).trim();
  const areasList = Object.values(AREAS_DATA);

  if (GREETING_PATTERNS.some((p) => p.test(normQuery))) {
    return {
      topTools: [],
      topAreas: [],
      intent: 'greeting',
      wantsFreeOnly: false,
      wantsOpenSource: false,
      wantsAi: false,
      contextPrompt: buildSystemContext([], [], diagnosticScores),
    };
  }

  const tokens = tokenize(query);

  const wantsFreeOnly = /\b(gratis|gratuito|gratuita|sin costo|cero pesos|free)\b/.test(normQuery);
  const wantsOpenSource = /\b(open source|codigo abierto|software libre|libre)\b/.test(normQuery);
  const wantsAi = /\b(ia|inteligencia artificial|chatgpt|gpt|gemini|automatizar con ia)\b/.test(normQuery);

  const isImplementationAsk =
    /\b(como|paso|pasos|implemento|implementar|empiezo|empezar|configuro|configurar|guia|tutorial|instalo|instalar|uso|usar)\b/.test(
      normQuery
    );

  const isSupportOrDetailsAsk =
    /\b(mas detalles|mas informacion|mas ayuda|ayuda|soporte|contacto|contactar|comunicarme|canal oficial|pagina oficial|enlace|link|web|sitio oficial|servicio tecnico|atencion)\b/.test(
      normQuery
    );

  const isDiagnosticAsk =
    /\b(diagnostico|mi negocio|mis areas|prioritaria|prioritarias|brecha|brechas|por donde empiezo|puntaje|madurez|estadisticas)\b/.test(
      normQuery
    );

  // Buscar herramientas mencionadas recientemente en la conversación para preguntas de seguimiento
  const recentAssistantTools =
    [...history]
      .reverse()
      .find((m) => m.sender === 'assistant' && m.recommendedTools && m.recommendedTools.length > 0)
      ?.recommendedTools || [];

  const hasExplicitBusinessContext = EXPLICIT_BUSINESS_CONTEXT_PATTERN.test(normQuery);

  // Guardrail 1: Rechazar inmediatamente consultas fuera de tema (recetas de cocina, chistes, clima, código, etc.)
  if (
    !isDiagnosticAsk &&
    !hasExplicitBusinessContext &&
    !(isSupportOrDetailsAsk && recentAssistantTools.length > 0) &&
    OUT_OF_SCOPE_PATTERNS.some((p) => p.test(normQuery))
  ) {
    return {
      topTools: [],
      topAreas: [],
      intent: 'out_of_scope',
      wantsFreeOnly,
      wantsOpenSource,
      wantsAi,
      contextPrompt: buildSystemContext([], [], diagnosticScores),
    };
  }

  // Puntaje de Áreas
  const scoredAreas = areasList.map((area) => {
    let score = 0;
    const areaTitleNorm = normalizeText(area.title);
    const areaTitleTokens = areaTitleNorm
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t));
    const areaCorpus = normalizeText(
      `${area.code} ${area.title} ${area.subtitle} ${area.desc} ${area.commonProblems.join(' ')}`
    );

    if (normQuery.includes(areaTitleNorm)) score += 22;
    if (tokens.includes(area.code.toLowerCase())) score += 18;

    for (const titleTok of areaTitleTokens) {
      if (hasWord(normQuery, titleTok) || tokens.includes(titleTok)) {
        score += 14;
      }
    }

    for (const tok of tokens) {
      if (hasWord(areaCorpus, tok)) score += 2;
    }

    return { area, score };
  });

  scoredAreas.sort((a, b) => b.score - a.score);
  const topAreaScore = scoredAreas[0]?.score || 0;
  const strongAreaMatch = topAreaScore >= 12;
  const topAreas = scoredAreas.filter((a) => a.score > 0).slice(0, 2).map((a) => a.area);
  const primaryArea = strongAreaMatch ? scoredAreas[0].area : null;

  // Puntaje de Herramientas
  const compactQuery = normQuery.replace(/[^a-z0-9]/g, '');
  const scoredTools: { ref: RecommendedToolRef; score: number; matchedByName: boolean }[] = [];

  for (const area of areasList) {
    const isPrimaryArea = primaryArea?.id === area.id;
    const areaMatched = topAreas.some((ta) => ta.id === area.id);

    for (const tool of area.tools) {
      let score = 0;
      let matchedByName = false;
      const toolBaseName = normalizeText(tool.name.replace(/\([^)]*\)/g, '')).trim();
      const toolCompactName = toolBaseName.replace(/[^a-z0-9]/g, '');
      const toolCorpus = normalizeText(
        `${tool.name} ${tool.category} ${tool.shortDesc} ${tool.problemSolved} ${tool.concreteBenefit} ${tool.recommendedFor || ''} ${tool.aiFeature || ''} ${area.title}`
      );

      // Coincidencia directa con nombre real de herramienta (ignorando paréntesis, stopwords y espacios STT)
      const nameParts = toolBaseName
        .split(/[\/\s]+/)
        .filter((p) => p.length > 2 && !STOPWORDS.has(p));

      if (
        (toolBaseName && hasWord(normQuery, toolBaseName)) ||
        (toolCompactName.length >= 4 && compactQuery.includes(toolCompactName))
      ) {
        score += 40;
        matchedByName = true;
      } else {
        for (const np of nameParts) {
          if (hasWord(normQuery, np)) {
            score += 24;
            matchedByName = true;
          }
        }
      }

      if (isPrimaryArea) score += 18;
      else if (areaMatched) score += 6;

      for (const tok of tokens) {
        if (hasWord(toolCorpus, tok)) score += 2.5;
      }

      // Solo aplicar filtros de precio/IA y prioridad del diagnóstico si ya hubo relevancia real con la consulta
      if (score > 0) {
        if (wantsFreeOnly) {
          if (tool.pricingType === 'free') score += 14;
          else if (tool.pricingType === 'open_source') score += 12;
          else if (tool.pricingType === 'freemium') score += 8;
          else if (tool.pricingType === 'paid_low_cost') score -= 10;
        }
        if (wantsOpenSource) {
          if (tool.pricingType === 'open_source') score += 14;
        }
        if (wantsAi) {
          if (tool.hasAi) score += 10;
        }

        if (diagnosticScores && !primaryArea) {
          const hasPriorityGap = diagnosticScores.priorityGaps.some((g) => g.areaId === area.id);
          if (hasPriorityGap) score += 1.5;
        }

        scoredTools.push({ ref: { tool, areaTitle: area.title }, score, matchedByName });
      }
    }
  }

  scoredTools.sort((a, b) => b.score - a.score);

  // Si pidió explícitamente un área sin mencionar una herramienta ajena por nombre, priorizar las de esa área
  const anyMatchedByName = scoredTools.some((s) => s.matchedByName);
  const candidateTools =
    primaryArea && !anyMatchedByName
      ? scoredTools.filter((s) =>
          primaryArea.tools.some((pt) => pt.id === s.ref.tool.id)
        )
      : scoredTools;

  const finalPool = candidateTools.length > 0 ? candidateTools : scoredTools;

  // Guardrail 2: Si es seguimiento pidiendo pasos de implementación o soporte sobre una herramienta previa, mantener el hilo
  const maxToolScore = finalPool[0]?.score || 0;
  if (
    (isImplementationAsk || isSupportOrDetailsAsk) &&
    !anyMatchedByName &&
    maxToolScore < 6 &&
    recentAssistantTools.length > 0
  ) {
    const isGuideFollowUp = isImplementationAsk;
    const targetTools = isGuideFollowUp
      ? [recentAssistantTools[0]]
      : recentAssistantTools.slice(0, 3);
    return {
      topTools: targetTools,
      topAreas,
      intent: isGuideFollowUp ? 'implementation_guide' : 'support_channel',
      wantsFreeOnly,
      wantsOpenSource,
      wantsAi,
      contextPrompt: buildSystemContext(targetTools, topAreas, diagnosticScores),
    };
  }

  // Guardrail 3: Si la pregunta no tiene ninguna relevancia real con áreas TIC ni herramientas ni diagnóstico, rechazar como fuera de alcance
  if (
    !isDiagnosticAsk &&
    ((OUT_OF_SCOPE_PATTERNS.some((p) => p.test(normQuery)) && !anyMatchedByName) ||
      (maxToolScore < 2.5 && topAreaScore < 4 && !hasExplicitBusinessContext))
  ) {
    return {
      topTools: [],
      topAreas: [],
      intent: 'out_of_scope',
      wantsFreeOnly,
      wantsOpenSource,
      wantsAi,
      contextPrompt: buildSystemContext([], [], diagnosticScores),
    };
  }

  // Detectar intención real: soporte/detalles, guía paso a paso o recomendación
  let intent: RetrievalResult['intent'] = 'recommendation';
  if (isDiagnosticAsk && !anyMatchedByName) {
    intent = 'diagnostic_review';
  } else if (isSupportOrDetailsAsk && finalPool[0]?.matchedByName) {
    intent = 'support_channel';
  } else if (isImplementationAsk && finalPool[0]?.matchedByName) {
    intent = 'implementation_guide';
  }

  let topTools: RecommendedToolRef[] = [];
  if (intent === 'diagnostic_review' && diagnosticScores) {
    const priorityAreaIds = Array.from(
      new Set(diagnosticScores.priorityGaps.map((g) => g.areaId))
    );
    if (priorityAreaIds.length === 0) {
      const sortedByLowest = Object.values(diagnosticScores.areas).sort(
        (a, b) => a.maturityScore - b.maturityScore
      );
      priorityAreaIds.push(...sortedByLowest.slice(0, 3).map((a) => a.areaId));
    }

    for (const aId of priorityAreaIds.slice(0, 3)) {
      const area = AREAS_DATA[aId];
      if (area && area.tools.length > 0) {
        const easyTool =
          area.tools.find(
            (t) =>
              t.difficulty === 'Fácil' &&
              (t.pricingType === 'free' || t.pricingType === 'freemium')
          ) || area.tools[0];
        topTools.push({ tool: easyTool, areaTitle: area.title });
      }
    }
  } else if (
    (intent === 'implementation_guide' || intent === 'support_channel') &&
    finalPool.length > 0
  ) {
    topTools = [finalPool[0].ref];
  } else {
    topTools = finalPool.slice(0, 3).map((s) => s.ref);
  }

  // Contexto enriquecido para OpenRouter: incluye todas las herramientas y guías del área principal o las recuperadas
  const contextTools: RecommendedToolRef[] = primaryArea
    ? primaryArea.tools.map((tool) => ({ tool, areaTitle: primaryArea.title }))
    : topTools;

  return {
    topTools,
    topAreas,
    intent,
    wantsFreeOnly,
    wantsOpenSource,
    wantsAi,
    contextPrompt: buildSystemContext(contextTools, topAreas, diagnosticScores),
  };
}

function buildSystemContext(
  tools: RecommendedToolRef[],
  areas: Area[],
  diagnosticScores: DiagnosticScores | null
): string {
  const parts: string[] = [];

  if (diagnosticScores) {
    const priorityNames = Array.from(
      new Set(
        diagnosticScores.priorityGaps.map(
          (g) => diagnosticScores.areas[g.areaId]?.name || g.areaId
        )
      )
    );
    parts.push(
      `PERFIL DEL NEGOCIO (sin datos personales): Índice global de madurez digital ${diagnosticScores.overallIndex}%. ` +
        (priorityNames.length > 0
          ? `Áreas prioritarias con procesos manuales: ${priorityNames.join(', ')}.`
          : 'Sin brechas críticas urgentes.')
    );
  } else {
    parts.push('PERFIL DEL NEGOCIO: El emprendedor aún no ha completado su autodiagnóstico.');
  }

  if (areas.length > 0) {
    parts.push(
      'ÁREAS RELEVANTES:\n' +
        areas
          .map((a) => `- ${a.title}: ${a.desc} Problemas comunes: ${a.commonProblems.join(' | ')}`)
          .join('\n')
    );
  }

  if (tools.length > 0) {
    parts.push(
      'HERRAMIENTAS DEL CATÁLOGO RECUPERADAS (usa SOLO estas herramientas y precios):\n' +
        tools
          .map(({ tool, areaTitle }) => {
            const stepsStr = tool.implementationSteps
              .map((s) => `Paso ${s.step} (${s.title}): ${s.description}`)
              .join(' ');
            return (
              `* ${tool.name} [Área: ${areaTitle} | Categoría: ${tool.category} | Precio: ${tool.pricingLabel} - ${tool.pricingDetail} | Dificultad: ${tool.difficulty}${tool.hasAi ? ' | Incluye IA' : ''} | Sitio oficial y soporte: ${tool.websiteUrl}]\n` +
              `  Problema que resuelve: ${tool.problemSolved}\n` +
              `  Beneficio: ${tool.concreteBenefit}\n` +
              `  Pasos iniciales: ${stepsStr}`
            );
          })
          .join('\n\n')
    );
  }

  return parts.join('\n\n');
}

function normalizeToolNameForSpeech(name: string): string {
  return name.replace(/\s*\/\s*/g, ' o ').trim();
}

function buildToolsSpeechSummary(
  tools: RecommendedToolRef[],
  leadIn: string
): string {
  if (tools.length === 0) return leadIn;

  const ordinals = ['Primero', 'Segundo', 'Y tercero'];
  const items = tools.slice(0, 3).map(({ tool }, idx) => {
    const cleanName = normalizeToolNameForSpeech(tool.name);
    const benefit = tool.concreteBenefit.trim().replace(/\.$/, '');
    if (tools.length === 1) {
      return `Te recomiendo ${cleanName}: ${benefit}.`;
    }
    const prefix = ordinals[idx] || `Opción ${idx + 1}`;
    return `${prefix}, ${cleanName}: ${benefit}.`;
  });

  if (tools.length === 1) {
    return items[0];
  }
  return `${leadIn} ${items.join(' ')}`;
}

function sanitizeLlmTextForSpeech(text: string): string {
  return text
    .replace(/\([^)]*·[^)]*\)/g, '') // Quita paréntesis tipo (Plan Gratuito · Marketing)
    .replace(
      /\((?:100%\s*Gratis|Gratis|Freemium|Código Abierto|Open Source|Bajo Costo|Plan Gratuito[^)]*)\)/gi,
      ''
    )
    .replace(/\s*\/\s*/g, ' o ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatOfficialChannelNote(tools: RecommendedToolRef[]): string {
  if (tools.length === 0) return '';
  if (tools.length === 1) {
    const { tool } = tools[0];
    return `Si necesitas más detalles o ayuda respecto a **${tool.name}**, también puedes comunicarte con su canal oficial: [Ir al soporte y sitio oficial de ${tool.name}](${tool.websiteUrl})`;
  }
  const links = tools
    .slice(0, 3)
    .map(({ tool }) => `• [${tool.name} — Canal oficial](${tool.websiteUrl})`)
    .join('\n');
  return `Si necesitas más detalles o ayuda directa, puedes comunicarte con los canales oficiales:\n${links}`;
}

export function generateLocalRagResponse(
  query: string,
  retrieval: RetrievalResult,
  diagnosticScores: DiagnosticScores | null
): { text: string; speechText: string } {
  const { intent, topTools, topAreas } = retrieval;

  if (intent === 'greeting') {
    if (diagnosticScores) {
      const topGap = diagnosticScores.priorityGaps[0];
      const gapAreaName = topGap
        ? diagnosticScores.areas[topGap.areaId]?.name
        : null;
      const text = `¡Hola! Soy Hera, tu asistente de transformación digital. Según tu diagnóstico actual (${diagnosticScores.overallIndex}% de madurez)${
        gapAreaName ? `, veo oportunidades importantes en ${gapAreaName}` : ''
      }. Pregúntame qué herramienta usar para algún área o cómo dar los primeros pasos para implementarla.`;
      return { text, speechText: text };
    }
    const text =
      '¡Hola! Soy Hera, tu asistente para digitalizar tu negocio. Puedes preguntarme qué herramienta usar en ventas, contabilidad, inventarios, WhatsApp o envíos, o pedirme el paso a paso para empezar sin gastar de más.';
    return { text, speechText: text };
  }

  if (intent === 'out_of_scope') {
    const text =
      'Solo puedo ayudarte con herramientas TIC y transformación digital para tu negocio (por ejemplo: ventas, finanzas, inventarios, marketing, personal, logística o atención al cliente). ¿Sobre qué área o proceso de tu empresa te gustaría recibir recomendaciones?';
    return { text, speechText: text };
  }

  if (intent === 'diagnostic_review') {
    if (!diagnosticScores) {
      const text =
        'Aún no encuentro respuestas guardadas de tu autodiagnóstico. Te invito a completarlo en la sección "Carga de Datos" (toma unos 10 minutos). Mientras tanto, dime qué área de tu negocio quieres mejorar hoy: ventas, finanzas, inventario, WhatsApp o envíos.';
      return { text, speechText: text };
    }

    if (topTools.length === 0) {
      const text = `Tu índice global de madurez digital es del ${diagnosticScores.overallIndex}%. ¡Vas por muy buen camino! Si deseas optimizar un proceso específico con IA o software libre, dime en qué área quieres enfocarte.`;
      return { text, speechText: text };
    }

    const summaryList = topTools
      .map(
        ({ tool, areaTitle }) =>
          `• En **${areaTitle}**: prueba **${tool.name}** (${tool.pricingLabel}), ideal para: ${tool.concreteBenefit}`
      )
      .join('\n');

    const text = `Según tu diagnóstico (${diagnosticScores.overallIndex}% de madurez), te sugiero priorizar estas opciones sencillas:\n\n${summaryList}\n\nHaz clic en cualquiera de las tarjetas de abajo para ver su guía de 3 pasos.`;
    const speechText = buildToolsSpeechSummary(
      topTools,
      'Según tu diagnóstico, estas herramientas pueden ayudarte a avanzar.'
    );
    return { text, speechText };
  }

  if (intent === 'support_channel' && topTools.length > 0) {
    const note = formatOfficialChannelNote(topTools);
    const primary = topTools[0].tool;
    const text =
      topTools.length === 1
        ? `Claro, para profundizar o resolver dudas específicas sobre **${primary.name}**, revisa la guía paso a paso o contáctalos directamente:\n\n${note}`
        : `Claro, aquí tienes el acceso directo a los canales oficiales de soporte de estas herramientas:\n\n${note}`;

    const spokenNames = topTools.map(({ tool }) => normalizeToolNameForSpeech(tool.name)).join(', ');
    const speechText = `Si necesitas más detalles o ayuda directa, en el chat te dejé los enlaces a los canales oficiales de ${spokenNames}.`;
    return { text, speechText };
  }

  if (intent === 'implementation_guide' && topTools.length > 0) {
    const { tool, areaTitle } = topTools[0];
    const stepsText = tool.implementationSteps
      .map((s) => `${s.step}. **${s.title}:** ${s.description}`)
      .join('\n');

    const officialNote = formatOfficialChannelNote([topTools[0]]);
    const text = `Para empezar con **${tool.name}** (área de ${areaTitle}, ${tool.pricingLabel}), sigue esta guía inicial:\n\n${stepsText}\n\n**Beneficio clave:** ${tool.concreteBenefit}\n\n${officialNote}`;

    const speechSteps = tool.implementationSteps
      .map((s, idx) => {
        const ord = idx === 0 ? 'Primero' : idx === 1 ? 'Segundo' : 'Y tercero';
        return `${ord}, ${s.title.toLowerCase()}: ${s.description}`;
      })
      .join(' ');
    const speechText = `Para empezar con ${normalizeToolNameForSpeech(
      tool.name
    )}, ${speechSteps} Con esto logras: ${tool.concreteBenefit} Si necesitas más ayuda, en el chat te dejé el enlace al canal oficial de ${normalizeToolNameForSpeech(
      tool.name
    )}.`;

    return { text, speechText };
  }

  if (topTools.length > 0) {
    const optionsText = topTools
      .map(
        ({ tool, areaTitle }) =>
          `• **${tool.name}** (${tool.pricingLabel} · ${areaTitle}): ${tool.shortDesc} **Mejora:** ${tool.concreteBenefit}`
      )
      .join('\n');

    const introLead =
      topAreas.length > 0 ? `Para **${topAreas[0].title}**` : 'Para lo que necesitas';
    const text = `${introLead}, te presento ${
      topTools.length === 1
        ? 'esta opción recomendada'
        : 'estas opciones neutrales (sin atarte a un solo proveedor)'
    }:\n\n${optionsText}\n\nPuedes abrir cualquiera de las tarjetas de abajo para ver su guía práctica de 3 pasos, o preguntarme cómo configurar una en específico.`;

    const countWord = topTools.length === 2 ? 'dos' : 'tres';
    const speechText = buildToolsSpeechSummary(
      topTools,
      `Para lo que necesitas, te recomiendo ${countWord} herramientas.`
    );
    return { text, speechText };
  }

  // Fallback si no hubo match claro con herramientas pero sí con un tema empresarial
  const text = `Entiendo tu duda sobre "${query}". En Hera cubrimos 9 áreas: Ventas, Marketing, Contabilidad, Personal, Inventario, Servicio al Cliente, Administración, Logística y Tecnología. Dime cuál de esas áreas quieres digitalizar o si buscas algo gratis, de código abierto o con IA, y te doy opciones concretas.`;
  return { text, speechText: text };
}

const SYSTEM_PROMPT = `Eres Hera, asistente cercano de transformación digital para microempresas y MiPymes de Sabana Centro (Chía, Cajicá, Zipaquirá, Colombia).
Reglas estrictas (guardrails):
1. ALCANCE OBLIGATORIO: Solo puedes ayudar con herramientas TIC, software, digitalización y organización de procesos de un negocio/empresa. Si el usuario pregunta cualquier tema ajeno (como recetas de cocina, chistes, tareas escolares, salud, deportes, clima, programación general, horóscopos o entretenimiento), RECHAZA la petición amablemente diciendo que solo puedes ayudarle con herramientas TIC para su negocio y NO menciones ni recomiendes ninguna herramienta.
2. Analiza exactamente lo que pide el emprendedor dentro del ámbito empresarial y responde directamente a esa necesidad.
3. Usa ÚNICAMENTE las herramientas, precios, beneficios, pasos y enlaces oficiales presentes en el CONTEXTO DEL CATÁLOGO LOCAL provisto. No inventes precios, enlaces ni herramientas externas.
4. Responde en español de Colombia, con lenguaje claro, cálido y sin tecnicismos innecesarios. Máximo 130 palabras.
5. Usa **negritas** para los nombres de las herramientas y evita colocar paréntesis largos con etiquetas como (Plan Gratuito · Área).
6. Cuando expliques cómo implementar una herramienta específica o el usuario pida más detalles/ayuda, finaliza invitándolo a comunicarse con el canal oficial usando su enlace Markdown exacto del contexto.
7. Mantén neutralidad entre proveedores: si hay opción gratis/open source o freemium disponible en el área solicitada, priorízala si el usuario pidió algo gratuito.`;

let devProxyUnavailable = false;
let edgeProxyUnavailable = false;

async function callOpenRouterProxy(
  systemWithContext: string,
  history: ChatMessage[],
  userQuery: string
): Promise<string | null> {
  const recentHistory = history.slice(-4).map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  const messages = [
    { role: 'system', content: systemWithContext },
    ...recentHistory,
    { role: 'user', content: userQuery },
  ];

  // 1. En desarrollo / preview local: usa el middleware seguro de Vite (OPENROUTER_API_KEY nunca sale del servidor Node)
  if (import.meta.env.DEV && !devProxyUnavailable) {
    try {
      const response = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (response.status === 404 || response.status === 501) {
        devProxyUnavailable = true;
      } else if (response.ok) {
        const data = (await response.json()) as { reply?: string };
        if (data.reply?.trim()) return data.reply.trim();
      }
    } catch {
      // Continuar al proxy Edge o respaldo local
    }
  }

  // 2. En producción: usa la Supabase Edge Function assistant-chat (secreto OPENROUTER_API_KEY en Supabase)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (supabaseUrl && supabaseAnonKey && !edgeProxyUnavailable) {
    try {
      const endpoint = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/assistant-chat`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (response.status === 404 || response.status === 501) {
        edgeProxyUnavailable = true;
      } else if (response.ok) {
        const data = (await response.json()) as { reply?: string };
        if (data.reply?.trim()) return data.reply.trim();
      }
    } catch {
      // Continuar al respaldo local
    }
  }

  return null;
}

export async function askAssistant(
  query: string,
  history: ChatMessage[],
  diagnosticScores: DiagnosticScores | null
): Promise<{
  text: string;
  speechText: string;
  recommendedTools: RecommendedToolRef[];
}> {
  const retrieval = retrieveRelevantContext(query, diagnosticScores, history);

  // Saludo o fuera de alcance no necesitan consumir cuota externa
  if (retrieval.intent === 'greeting' || retrieval.intent === 'out_of_scope') {
    const local = generateLocalRagResponse(query, retrieval, diagnosticScores);
    return {
      text: local.text,
      speechText: local.speechText,
      recommendedTools: retrieval.topTools,
    };
  }

  const systemWithContext = `${SYSTEM_PROMPT}\n\n--- CONTEXTO RECUPERADO DEL CATÁLOGO LOCAL (RAG) ---\n${retrieval.contextPrompt}`;

  try {
    const llmText = await callOpenRouterProxy(systemWithContext, history, query);
    if (llmText) {
      const llmRefused =
        /\b(solo puedo ayudarte|solo te puedo ayudar|fuera de mi alcance|no puedo ayudarte con|no corresponde a herramientas tic)\b/i.test(
          llmText
        );
      if (llmRefused) {
        return {
          text: llmText,
          speechText: sanitizeLlmTextForSpeech(llmText),
          recommendedTools: [],
        };
      }

      let finalText = llmText;
      if (
        (retrieval.intent === 'implementation_guide' || retrieval.intent === 'support_channel') &&
        retrieval.topTools.length > 0
      ) {
        const primaryUrl = retrieval.topTools[0].tool.websiteUrl;
        if (primaryUrl && !finalText.includes(primaryUrl)) {
          const targetTools =
            retrieval.intent === 'implementation_guide' ? [retrieval.topTools[0]] : retrieval.topTools;
          finalText = `${finalText}\n\n${formatOfficialChannelNote(targetTools)}`;
        }
      }

      const speechText =
        retrieval.topTools.length > 0 && retrieval.intent === 'recommendation'
          ? buildToolsSpeechSummary(
              retrieval.topTools,
              `Para lo que necesitas, te recomiendo ${
                retrieval.topTools.length === 1
                  ? 'esta herramienta'
                  : retrieval.topTools.length === 2
                  ? 'dos herramientas'
                  : 'tres herramientas'
              }.`
            )
          : sanitizeLlmTextForSpeech(finalText);
      return {
        text: finalText,
        speechText,
        recommendedTools: retrieval.topTools,
      };
    }
  } catch (err) {
    console.warn('OpenRouter proxy no disponible, usando respaldo RAG integrado:', err);
  }

  // Respaldo garantizado: Motor RAG integrado sobre el catálogo y diagnóstico ($0, sin límites)
  const local = generateLocalRagResponse(query, retrieval, diagnosticScores);
  return {
    text: local.text,
    speechText: local.speechText,
    recommendedTools: retrieval.topTools,
  };
}
