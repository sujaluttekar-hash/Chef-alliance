
import { GoogleGenAI, Type } from "@google/genai";
import { Audit } from './types';

export const getAuditAIInsights = async (audits: Audit[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const auditDataStr = audits.map(a => `Audit at ${a.propertyId} with score ${a.complianceScore}% on ${a.datetime}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these chef compliance audits and provide a brief executive summary of trends, critical failures, and recommendations. 
      Format as a professional HTML block with <ul> and <strong>.
      Audits:
      ${auditDataStr}`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Unable to generate AI insights at this time.";
  }
};
