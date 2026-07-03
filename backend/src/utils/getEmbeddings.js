import { GEMINI_API_KEY } from "../db/env.js";
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2-preview",
    apiKey: GEMINI_API_KEY,
    output_dimensionality: 768
});

export async function getEmbeddings(content) {
    return await embeddings.embedQuery(content);
}

