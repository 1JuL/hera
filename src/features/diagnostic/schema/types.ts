export type QuestionType =
  | 'single'
  | 'multi'
  | 'number'
  | 'text'
  | 'scale'
  | 'range'
  | 'boolean';

export type SectionId = 'K' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export type AreaId = 'VEN' | 'MKT' | 'FIN' | 'RRH' | 'OPE' | 'CLI' | 'ADM';

export type Tier = 'core' | 'extended';

export interface QuestionOption {
  value: string;
  label: string;
  score?: number;
}

export interface Question {
  id: string;
  section: SectionId;
  area?: AreaId;
  tier: Tier;
  type: QuestionType;
  label: string;
  help?: string;
  required?: boolean;
  options?: QuestionOption[];
  showIf?: { id: string; in: string[] };
}

export interface SectionInfo {
  id: SectionId;
  title: string;
  subtitle: string;
  icon?: string;
}

export interface QuestionnaireSchema {
  version: string;
  title: string;
  description: string;
  sections: SectionInfo[];
  questions: Question[];
}

export type Answers = Record<string, string | string[] | number | boolean | null>;

export type DiagnosticStatus = 'draft' | 'completed';

export interface DiagnosticDraft {
  version_id: string;
  answers: Answers;
  tierMode: 'core' | 'all';
  currentSectionIndex: number;
  status: DiagnosticStatus;
  updated_at: string;
  completed_at?: string;
}

export interface AreaScore {
  areaId: AreaId;
  name: string;
  maturityScore: number; // 0 a 100%
  importance: number; // 1 a 5
  activitiesCount: number;
  manualCount: number; // estado 0 o 1
  digitalCount: number; // estado 2 o 3
  gaps: {
    id: string;
    name: string;
    state: number;
  }[];
}

export interface DiagnosticScores {
  overallIndex: number; // 0 a 100%
  areas: Record<AreaId, AreaScore>;
  priorityGaps: {
    areaId: AreaId;
    activityId: string;
    activityName: string;
    currentState: number; // 0 o 1
    importance: number; // 1 a 5
    currentStateLabel: string;
  }[];
  salesChannels: {
    channel: string;
    isMain: boolean;
  }[];
  paymentAdoption: {
    digitalMethods: string[];
    traditionalMethods: string[];
    digitalRatio: number; // 0 a 1
  };
  financialDiscipline: {
    score: number; // 0 a 100%
    registersSales: boolean;
    knowsCosts: boolean;
    structuredPricing: boolean;
    separatesPersonalFinances: boolean;
  };
  toolsInUse: string[];
  techReadiness: {
    devices: string[];
    internetType: string;
    techComfortLevel: number; // 1 a 5
    monthlyBudgetCop: string;
  };
}
