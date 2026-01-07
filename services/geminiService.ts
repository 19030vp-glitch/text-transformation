
import { GoogleGenAI, Type } from "@google/genai";
import { ToneType, RefinementResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const refineText = async (
  text: string, 
  tone: ToneType = ToneType.PROFESSIONAL
): Promise<RefinementResponse> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are an expert English linguist, professional editor, and translation specialist.
    Your task is to take the provided input text (which may be in any language) and transform it into high-quality, professional English.
    
    GUIDELINES:
    1. Translate to English if the input is in another language.
    2. Correct all grammatical, spelling, and punctuation errors.
    3. Enhance the vocabulary to be sophisticated yet natural.
    4. Ensure professional sentence structures and flow.
    5. Maintain the original meaning but adapt the tone to: ${tone}.
    6. Return ONLY the refined English text and a brief explanation of key improvements.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedText: {
              type: Type.STRING,
              description: 'The polished, professional English version of the input.'
            },
            explanation: {
              type: Type.STRING,
              description: 'A very brief summary of major improvements made.'
            }
          },
          required: ['refinedText']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      refinedText: result.refinedText || "Unable to refine text. Please try again.",
      explanation: result.explanation
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to refine text. Please check your connection or try again later.");
  }
};
