import { AreaId } from '@/features/diagnostic/schema/types';

export type ToolPricingType = 'open_source' | 'free' | 'freemium' | 'paid_low_cost';
export type ToolDifficulty = 'Fácil' | 'Media' | 'Avanzada';

export interface ToolImplementationStep {
  step: number;
  title: string;
  description: string;
  tip?: string;
}

export interface TicTool {
  id: string;
  name: string;
  category: string;
  pricingType: ToolPricingType;
  pricingLabel: string;
  pricingDetail: string;
  hasAi: boolean;
  aiFeature?: string;
  shortDesc: string;
  problemSolved: string;
  concreteBenefit: string;
  impactMetric: string; // Ej: "+ Ventas", "Ahorro de Tiempo", "Control Total", "Fidelización", "Seguridad"
  difficulty: ToolDifficulty;
  websiteUrl: string;
  recommendedFor?: string;
  implementationSteps: ToolImplementationStep[];
}

export type MapAreaId = AreaId;

export interface Solution {
  name: string;
  desc: string;
}

export interface Area {
  id: MapAreaId;
  code: string;
  title: string;
  subtitle: string;
  iconName: string;
  bgIcon: string;
  colorIcon: string;
  bgCard: string;
  badgeBg: string;
  badgeColor: string;
  desc: string;
  itemBg: string;
  diagnosticRelation: string;
  commonProblems: string[];
  tools: TicTool[];
  solutions: Solution[];
}
