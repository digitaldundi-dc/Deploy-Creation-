
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ContentCard, 
  CampaignSuggestion, 
  FullCampaignPlan, 
  WhatsAppTemplate, 
  AssetAnalysis,
  Language
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const GEN_MODEL = "gemini-3-flash-preview";

const SYSTEM_PERSONA = `You are the "Social Strategist Enterprise AI."
Every response MUST include: 1. High-impact Titles, 2. Viral Hooks, 3. Strategic Hashtags, 4. Optimal Time to Post, 5. Best Platform for maximum reach.`;

const getLanguageName = (lang: Language) => {
  switch(lang) {
    case 'te': return 'Telugu';
    case 'hi': return 'Hindi';
    default: return 'English';
  }
};

export const generateStrategy = async (
  industry: string, 
  product: string, 
  location: string, 
  offer: string, 
  targetAudience: string, 
  userInterests: string, 
  brandVoice: string, 
  communicationTone: string, 
  lang: Language, 
  description?: string,
  fileData?: string,
  mimeType: string = "image/jpeg"
): Promise<ContentCard[]> => {
  const parts: any[] = [{ text: `Sector: ${industry} | Product: ${product} | Offer: ${offer} | Language: ${getLanguageName(lang)} | Description: ${description}` }];
  
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: fileData
      }
    });
    parts[0].text += `\nCRITICAL: Analyze the attached ${mimeType.startsWith('video/') ? 'video' : 'image'} to align the visual aesthetic with the suggested hooks and platform selection.`;
  }

  const response = await ai.models.generateContent({
    model: GEN_MODEL,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PERSONA,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            bestTimeToPost: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            currentTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
            visualSuggestion: { type: Type.STRING, enum: ['Video', 'Image'] },
            bestPlatform: { type: Type.STRING }
          },
          required: ["viralHooks", "title", "description", "bestTimeToPost", "hashtags", "currentTrends", "visualSuggestion", "bestPlatform"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const planFullCampaign = async (
  brief: string, 
  industry: string, 
  budget: string, 
  platforms: string[], 
  type: string, 
  days: string, 
  targetUsers: string, 
  lang: Language, 
  fileData?: string,
  mimeType: string = "image/jpeg"
): Promise<FullCampaignPlan[]> => {
  const parts: any[] = [{ text: `ACT AS ELITE AD PLANNER. DEVELOP 2 DISTINCT CAMPAIGN VARIATIONS. 
    Brief: ${brief} | Sector: ${industry} | Budget: ${budget} | Objective: ${type} | Language: ${getLanguageName(lang)}` }];
  
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: fileData
      }
    });
    parts[0].text += `\nIMPORTANT: Analyze the attached ${mimeType.startsWith('video/') ? 'video sequence' : 'visual creative'} and tailor the strategy (hooks, concepts, and platforms) to work perfectly with this specific asset.`;
  }

  const response = await ai.models.generateContent({
    model: GEN_MODEL,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PERSONA,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            variationName: { type: Type.STRING },
            variationGoal: { type: Type.STRING },
            summary: { type: Type.STRING },
            adType: { type: Type.STRING },
            budgetPlan: { type: Type.STRING },
            bestTimeToPost: { type: Type.STRING },
            bestPlatform: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            creativePlan: {
              type: Type.OBJECT,
              properties: {
                format: { type: Type.STRING, enum: ['Image', 'Video', 'Carousel'] },
                concept: { type: Type.STRING },
                hook: { type: Type.STRING }
              }
            }
          },
          required: ["variationName", "variationGoal", "summary", "adType", "budgetPlan", "bestTimeToPost", "bestPlatform", "hashtags", "creativePlan"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const generateWhatsAppMsg = async (
  prompt: string, 
  segment: string, 
  segmentDetails: string, 
  voice: string, 
  tone: string, 
  lang: Language, 
  fileData?: string,
  mimeType: string = "image/jpeg"
): Promise<WhatsAppTemplate[]> => {
  const parts: any[] = [{ text: `WhatsApp for: ${prompt} | Language: ${getLanguageName(lang)}` }];
  
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: fileData
      }
    });
    parts[0].text += `\nIncorporate the visual details from the attached ${mimeType.startsWith('video/') ? 'video' : 'image'} into the conversational flow.`;
  }

  const response = await ai.models.generateContent({
    model: GEN_MODEL,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PERSONA,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { 
            message: { type: Type.STRING }, 
            cta: { type: Type.STRING }, 
            emojisUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
            bestTimeToPost: { type: Type.STRING },
            synergyPlatform: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const performAudit = async (
  brief: string,
  budget: string,
  funnelGoal: string,
  lang: Language,
  fileData?: string,
  mimeType: string = "image/jpeg"
): Promise<any> => {
  const parts: any[] = [{ text: `PERFORM ALGORITHMIC CAMPAIGN AUDIT:
    Campaign Narrative: "${brief}"
    Total Deployment Budget: ₹${budget}
    Primary Strategic Objective: ${funnelGoal}
    Output Language: ${getLanguageName(lang)}
    
    MANDATE:
    1. Conduct a deep-tier audit against industry-specific ROI benchmarks.
    2. Evaluate the "Strategic Readiness Score" (0-100) based on the goal: ${funnelGoal}.
    3. Identify specific funnel friction points where the budget might be wasted.
    4. Provide 3 executive refinement protocols specifically to optimize for ${funnelGoal}.` }];

  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: fileData
      }
    });
    parts[0].text += `\nIMPORTANT: Also audit the attached ${mimeType.startsWith('video/') ? 'video' : 'image'} for creative alignment with the goal of ${funnelGoal}.`;
  }

  const response = await ai.models.generateContent({
    model: GEN_MODEL,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          funnelHealth: {
            type: Type.OBJECT,
            properties: { awareness: { type: Type.NUMBER }, consideration: { type: Type.NUMBER }, conversion: { type: Type.NUMBER } }
          },
          platformViability: {
            type: Type.OBJECT,
            properties: { meta: { type: Type.NUMBER }, google: { type: Type.NUMBER }, linkedin: { type: Type.NUMBER } }
          },
          leakagePoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { stage: { type: Type.STRING }, issue: { type: Type.STRING }, severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] } }
            }
          },
          strategicRefinements: { type: Type.ARRAY, items: { type: Type.STRING } },
          executiveSummary: { type: Type.STRING }
        },
        required: ["score", "funnelHealth", "platformViability", "leakagePoints", "strategicRefinements", "executiveSummary"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const analyzeAsset = async (industry: string, product: string, offer: string, channel: string, target: string, voice: string, lang: Language, context: string, fileData?: string, mimeType: string = "image/jpeg"): Promise<AssetAnalysis[]> => {
  const parts: any[] = [{ text: `NEURAL ASSET AUDIT for ${product} in ${getLanguageName(lang)}. Include heatmap prediction.` }];
  if (fileData) parts.push({ inlineData: { mimeType: mimeType, data: fileData } });

  const response = await ai.models.generateContent({
    model: GEN_MODEL,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PERSONA,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            improvedHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvedTitle: { type: Type.STRING },
            improvedDescription: { type: Type.STRING },
            optimizedHashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            engagementAnalysis: { type: Type.STRING },
            bestTimeToPost: { type: Type.STRING },
            bestPlatform: { type: Type.STRING },
            visualHeatmapPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, intensity: { type: Type.NUMBER }, label: { type: Type.STRING } }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const suggestCampaign = async (brief: string, industry: string, budget: string, platforms: string[], type: string, lang: Language): Promise<CampaignSuggestion[]> => {
  const response = await ai.models.generateContent({
    model: GEN_MODEL,
    contents: `Campaign: ${brief} | Budget: ${budget}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            campaignTitle: { type: Type.STRING },
            targetDemographics: { type: Type.STRING },
            budgetAllocation: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { platform: { type: Type.STRING }, amount: { type: Type.STRING }, percentage: { type: Type.NUMBER } } } }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
};

export const generateAlertEmail = async (audit: any, recipient: string, lang: Language): Promise<string> => {
  const response = await ai.models.generateContent({
    model: GEN_MODEL,
    contents: `Email alert for ${recipient}`,
    config: { systemInstruction: "Concise analyst tone." }
  });
  return response.text || "";
};
