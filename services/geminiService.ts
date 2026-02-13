
import { GoogleGenAI, Type } from "@google/genai";
import { MedicineInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MEDICINE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    brandName: { type: Type.STRING },
    genericName: { type: Type.STRING },
    ingredients: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    purpose: { type: Type.STRING },
    reasonsForUse: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific medical conditions or reasons why this medicine is used."
    },
    sideEffects: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    relatedMedicines: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-5 similar medicines, alternatives, or medications in the same class."
    },
    isMedicine: { type: Type.BOOLEAN },
    confidence: { type: Type.NUMBER }
  },
  required: ["brandName", "ingredients", "purpose", "reasonsForUse", "sideEffects", "relatedMedicines", "isMedicine"]
};

export async function analyzeMedicineImage(base64Image: string): Promise<MedicineInfo> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Analyze this image of medicine packaging or a pill. 
  Determine if it is a pharmaceutical product. 
  Extract the brand name, generic name, active ingredients, its primary medical purpose, specific reasons for use (indications), a list of common side effects, and suggest 3-5 related or alternative medicines.
  Be precise and prioritize safety information.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: MEDICINE_SCHEMA
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  if (!result.isMedicine) {
    throw new Error("The captured image does not appear to be a medicine packaging or tablet.");
  }

  return { 
    ...result, 
    imageUrl: `data:image/jpeg;base64,${base64Image}` 
  } as MedicineInfo;
}

export async function getMedicineSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];
  
  const model = 'gemini-3-flash-preview';
  const prompt = `List 5 popular medicine brand names or generic names that start with or match the characters: "${query}". Return only a simple list of names.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ text: prompt }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

export async function searchMedicineByName(query: string): Promise<MedicineInfo> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Provide detailed information for the medicine named: "${query}". 
  Include its brand name, generic name, active ingredients, primary medical purpose, specific reasons for use (indications) as a list, common side effects, and suggest 3-5 related or alternative medicines.
  If the input is not a recognized medicine, indicate isMedicine: false.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ text: prompt }],
    config: {
      responseMimeType: "application/json",
      responseSchema: MEDICINE_SCHEMA
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  if (!result.isMedicine) {
    throw new Error(`Could not find reliable information for "${query}". Please check the spelling or try another name.`);
  }

  // Generate a beautiful medical illustration for the searched item
  try {
    const imgResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A clean, high-quality, clinical 3D render illustration of a medicine bottle or pharmaceutical box for ${result.brandName}. White background, professional studio lighting, medical aesthetic.` }]
      }
    });

    for (const part of imgResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        result.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (err) {
    console.warn("Image generation failed, proceeding without image", err);
  }

  return result as MedicineInfo;
}
