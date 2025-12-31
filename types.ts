
export enum AppSection {
  STRATEGY_PLANNER = 'strategy-planner',
  CAMPAIGN_STRATEGIST = 'campaign-strategist',
  WHATSAPP_MARKETING = 'whatsapp-marketing',
  ASSET_IMPROVEMENT = 'asset-improvement',
  ANALYTICS = 'analytics'
}

export type Language = 'en' | 'te' | 'hi';
export type Theme = 'professional-dark' | 'classic-light';

export interface UserSettings {
  language: Language;
  theme: Theme;
}

export interface UserData {
  name: string;
  mobile: string;
  location: string;
  password?: string;
  isDev?: boolean;
}

export interface ContentCard {
  viralHooks: string[];
  title: string;
  description: string;
  bestTimeToPost: string;
  hashtags: string[];
  currentTrends: string[];
  visualSuggestion: 'Video' | 'Image';
  bestPlatform: string;
}

export interface CampaignSuggestion {
  campaignTitle: string;
  targetDemographics: string;
  budgetAllocation: { platform: string; amount: string; percentage: number }[];
}

export interface FullCampaignPlan {
  variationName: string;
  variationGoal: string;
  summary: string;
  adType: string;
  budgetPlan: string;
  bestTimeToPost: string;
  hashtags: string[];
  bestPlatform: string;
  creativePlan: {
    format: 'Image' | 'Video' | 'Carousel';
    concept: string;
    hook: string;
  };
}

export interface WhatsAppTemplate {
  message: string;
  cta: string;
  emojisUsed: string[];
  bestTimeToPost: string;
  synergyPlatform: string;
  hashtags?: string[];
}

export interface AssetAnalysis {
  improvedHooks: string[];
  improvedTitle: string;
  improvedDescription: string;
  optimizedHashtags: string[];
  engagementAnalysis: string;
  bestTimeToPost: string;
  bestPlatform: string;
  visualHeatmapPoints?: { x: number; y: number; intensity: number; label: string }[];
}

export interface SavedItem<T> {
  id: string;
  timestamp: number;
  data: T;
  label: string;
}
