import { GoogleGenAI } from "@google/genai";
import { GOOGLE_GEMINI_API_KEY } from "../db/env.js";


const genAI = new GoogleGenAI({ apiKey: GOOGLE_GEMINI_API_KEY });


export async function getEmbeddings(text) {
    const response = await genAI.models.embedContent({
        model: "gemini- 2.0 - flash",
        contents: text
    })
    return response.embeddings[0].values;
}


