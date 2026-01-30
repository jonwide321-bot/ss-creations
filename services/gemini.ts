
import { GoogleGenAI, Type } from "@google/genai";

// Gift suggestions function using Gemini API
export async function getGiftSuggestions(userContext: string) {
  // Always initialize GoogleGenAI with the API key from process.env.API_KEY inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user is looking for a gift. Context: "${userContext}". Based on the common types of gifts available at SS Creations like Flowers, Gourmet items, Home Decor, and Personalized gifts, suggest 3 specific gift ideas and the reason why they fit. Provide the output in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            suggestion: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["suggestion", "reason"]
        }
      }
    }
  });

  try {
    // Access the .text property directly (do not call as a function)
    const jsonStr = response.text || '[]';
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Failed to parse AI response", error);
    return [];
  }
}

// Greeting message generator using Gemini API
export async function generateGreetingMessage(productName: string, occasion: string, recipient: string, tone: string) {
  // Always initialize GoogleGenAI with the API key from process.env.API_KEY inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a short, beautiful greeting card message for a gift. 
    Product: ${productName}
    Occasion: ${occasion}
    Recipient: ${recipient}
    Tone: ${tone}
    Provide 3 different options. Keep them elegant and heartfelt. 
    Language: If the input looks like Sinhala, provide Sinhala translations too. Otherwise, English.
    Output in JSON format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            style: { type: Type.STRING }
          },
          required: ["message", "style"]
        }
      }
    }
  });

  try {
    // Access the .text property directly (do not call as a function)
    const jsonStr = response.text || '[]';
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Failed to parse AI greeting response", error);
    return [];
  }
}
