export type BenchmarkBlock = 'micronegocios_dane' | 'mipymes_formales';
export type SegmentKey = 'cabeceras' | 'nacional' | 'micro_formal';

export interface BenchmarkIndicator {
  id: string;
  label: string;
  block: BenchmarkBlock;
  values: Partial<Record<SegmentKey, number>>;
  source: string;
  year: number;
  universe: string;
  derived?: boolean;
}

/**
 * Arreglo de indicadores de referencia basados en DANE EMICRON 2024, CIPE 2024 y ACOPI 2022.
 * Nota: 'banca_digital' fue excluido del arreglo según especificación.
 */
export const BENCHMARKS: BenchmarkIndicator[] = [
  // ── Bloque 1: Micronegocios de Colombia (DANE, 2024) ──
  {
    id: 'uso_internet',
    label: 'Uso de internet en la actividad del negocio',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 61.7,
      nacional: 49.6,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501 en 24 departamentos y Bogotá)',
    derived: true,
  },
  {
    id: 'uso_celular',
    label: 'Uso de teléfono celular en el negocio',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 79.2,
      nacional: 70.9,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501)',
    derived: false,
  },
  {
    id: 'uso_computador',
    label: 'Uso de computador, tableta o portátil',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 10.9,
      nacional: 10.9,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501)',
    derived: true,
  },
  {
    id: 'pagos_transferencia',
    label: 'Aceptación de transferencias o pagos por internet',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 51.4,
      nacional: 38.9,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501)',
    derived: false,
  },
  {
    id: 'pagos_tarjeta',
    label: 'Aceptación de pagos con tarjeta débito o crédito',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 2.9,
      nacional: 2.9,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501)',
    derived: true,
  },
  {
    id: 'registro_contable',
    label: 'Lleva registro contable (formal o informal)',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 38.6,
      nacional: 31.8,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501)',
    derived: true,
  },
  {
    id: 'registro_contable_formal',
    label: 'Uso de un método contable formal',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 6.2,
      nacional: 4.7,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501)',
    derived: false,
  },
  {
    id: 'formalidad_rut',
    label: 'Cuenta con Registro Único Tributario (RUT)',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 29.6,
      nacional: 22.4,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501)',
    derived: false,
  },
  {
    id: 'camara_comercio',
    label: 'Registro mercantil en Cámara de Comercio',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 10.3,
      nacional: 10.3,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (5.297.252 en marco muestral)',
    derived: true,
  },
  {
    id: 'mas_de_una_persona',
    label: 'Equipo de trabajo de más de una persona',
    block: 'micronegocios_dane',
    values: {
      cabeceras: 17.7,
      nacional: 17.7,
    },
    source: 'DANE, EMICRON',
    year: 2024,
    universe: 'Micronegocios (muestra ~78.501)',
    derived: true,
  },

  // ── Bloque 2: Mipymes formales (CIPE 2024, ACOPI 2022) ──
  {
    id: 'facturacion_electronica',
    label: 'Facturación electrónica',
    block: 'mipymes_formales',
    values: {
      micro_formal: 24.0,
    },
    source: 'CIPE / CNC / iNNpulsa / MinCIT',
    year: 2024,
    universe: 'Microempresas formales (muestra 4.107)',
    derived: false,
  },
  {
    id: 'billeteras_digitales',
    label: 'Uso de billeteras digitales (Nequi, Daviplata, etc.)',
    block: 'mipymes_formales',
    values: {
      micro_formal: 84.0,
    },
    source: 'CIPE / CNC / iNNpulsa / MinCIT',
    year: 2024,
    universe: 'Microempresas formales (muestra 4.107)',
    derived: false,
  },
  {
    id: 'responsable_tecnologia',
    label: 'Responsable de temas tecnológicos en la empresa',
    block: 'mipymes_formales',
    values: {
      micro_formal: 52.0,
    },
    source: 'CIPE / CNC / iNNpulsa / MinCIT',
    year: 2024,
    universe: 'Mipymes formales (muestra 4.107)',
    derived: false,
  },
  {
    id: 'madurez_digital_avanzada',
    label: 'Nivel avanzado de apropiación digital',
    block: 'mipymes_formales',
    values: {
      micro_formal: 42.0,
    },
    source: 'CIPE / CNC / iNNpulsa / MinCIT',
    year: 2024,
    universe: 'Microempresas formales (muestra 4.107)',
    derived: false,
  },
  {
    id: 'redes_sociales_comerciales',
    label: 'Uso de redes sociales con fines comerciales',
    block: 'mipymes_formales',
    values: {
      micro_formal: 77.1,
    },
    source: 'ACOPI (citado en Estudio Colsubsidio)',
    year: 2022,
    universe: 'Microempresas',
    derived: false,
  },
  {
    id: 'presupuesto_tic',
    label: 'Destina presupuesto a tecnología (TIC)',
    block: 'mipymes_formales',
    values: {
      micro_formal: 17.9,
    },
    source: 'GAN Colombia (citado en Estudio Colsubsidio)',
    year: 2021,
    universe: 'Microempresas',
    derived: false,
  },
];

/**
 * Mapa de evaluación de respuestas del negocio.
 * Retorna true ("Sí"), false ("No") o null (si la pregunta no fue respondida o no aplica).
 */
export const USER_FLAGS: Record<string, (answers: Record<string, any>) => boolean | null> = {
  uso_internet: (answers) => {
    const val = answers['G01'];
    if (val === undefined || val === null || val === '') return null;
    return val === 'datos_moviles' || val === 'fijo_fibra';
  },

  uso_celular: (answers) => {
    const val = answers['G02'];
    if (!val || (Array.isArray(val) && val.length === 0)) return null;
    return Array.isArray(val) && val.includes('smartphone');
  },

  uso_computador: (answers) => {
    const val = answers['G02'];
    if (!val || (Array.isArray(val) && val.length === 0)) return null;
    return Array.isArray(val) && (val.includes('computador') || val.includes('tablet'));
  },

  pagos_transferencia: (answers) => {
    const val = answers['B07'];
    if (!val || (Array.isArray(val) && val.length === 0)) return null;
    return (
      Array.isArray(val) &&
      (val.includes('transferencia') || val.includes('nequi_daviplata') || val.includes('pasarela_web'))
    );
  },

  pagos_tarjeta: (answers) => {
    const val = answers['B07'];
    if (!val || (Array.isArray(val) && val.length === 0)) return null;
    return Array.isArray(val) && (val.includes('datafono') || val.includes('link_pago'));
  },

  registro_contable: (answers) => {
    const val = answers['B09'];
    if (val === undefined || val === null || val === '') return null;
    if (['cuaderno', 'excel_sheets', 'app_software'].includes(val)) return true;
    if (['no_registra', 'de_memoria'].includes(val)) return false;
    return false;
  },

  registro_contable_formal: (answers) => {
    const b09 = answers['B09'];
    const eFin01 = answers['E-FIN-01'];
    if (
      (b09 === undefined || b09 === null || b09 === '') &&
      (eFin01 === undefined || eFin01 === null || eFin01 === '')
    ) {
      return null;
    }
    return b09 === 'app_software' || Number(eFin01) >= 2;
  },

  formalidad_rut: (answers) => {
    const val = answers['A05'];
    if (val === undefined || val === null || val === '') return null;
    return val === 'rut' || val === 'rut_camara';
  },

  camara_comercio: (answers) => {
    const val = answers['A05'];
    if (val === undefined || val === null || val === '') return null;
    return val === 'rut_camara';
  },

  mas_de_una_persona: (answers) => {
    const val = answers['A06'];
    if (val === undefined || val === null || val === '') return null;
    return val !== '1';
  },

  facturacion_electronica: (answers) => {
    const eFin01 = answers['E-FIN-01'];
    const f01 = answers['F01'];
    if (
      (eFin01 === undefined || eFin01 === null || eFin01 === '') &&
      (!f01 || (Array.isArray(f01) && f01.length === 0))
    ) {
      return null;
    }
    const hasTool = Array.isArray(f01) && (f01.includes('siigo') || f01.includes('alegra'));
    return Number(eFin01) === 3 || hasTool;
  },

  billeteras_digitales: (answers) => {
    const b07 = answers['B07'];
    const f01 = answers['F01'];
    if (
      (!b07 || (Array.isArray(b07) && b07.length === 0)) &&
      (!f01 || (Array.isArray(f01) && f01.length === 0))
    ) {
      return null;
    }
    const inB07 = Array.isArray(b07) && b07.includes('nequi_daviplata');
    const inF01 = Array.isArray(f01) && f01.includes('nequi_daviplata_negocios');
    return inB07 || inF01;
  },

  responsable_tecnologia: (answers) => {
    const val = answers['F05'];
    if (val === undefined || val === null || val === '') return null;
    return ['propietario', 'empleado', 'externo'].includes(val);
  },

  madurez_digital_avanzada: (answers) => {
    const g04 = answers['G04'];
    const f01 = answers['F01'];
    if (
      (g04 === undefined || g04 === null || g04 === '') &&
      (!f01 || (Array.isArray(f01) && f01.length === 0))
    ) {
      return null;
    }
    const hasAI = g04 === 'frecuente' || g04 === 'ocasional';
    const hasMultipleTools = Array.isArray(f01) && f01.length >= 4;
    return hasAI || hasMultipleTools;
  },

  redes_sociales_comerciales: (answers) => {
    const b05 = answers['B05'];
    const f01 = answers['F01'];
    if (
      (!b05 || (Array.isArray(b05) && b05.length === 0)) &&
      (!f01 || (Array.isArray(f01) && f01.length === 0))
    ) {
      return null;
    }
    const inB05 = Array.isArray(b05) && b05.includes('redes_sociales');
    const inF01 =
      Array.isArray(f01) &&
      (f01.includes('instagram') || f01.includes('facebook') || f01.includes('tiktok'));
    return inB05 || inF01;
  },

  presupuesto_tic: (answers) => {
    const f02 = answers['F02'];
    const h05 = answers['H05'];
    if (
      (f02 === undefined || f02 === null || f02 === '') &&
      (h05 === undefined || h05 === null || h05 === '')
    ) {
      return null;
    }
    return (f02 !== undefined && f02 !== 'cero') || (h05 !== undefined && h05 !== 'cero');
  },
};
