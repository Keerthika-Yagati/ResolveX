import { pipeline } from "@xenova/transformers";

// Generate vector embedding from text using local model
export async function generateVector(text) {
    try {
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const feature = await extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(feature.data);
    } catch (error) {
        console.error("Vector generation error:", error);
        return null;
    }
}

// Cosine Similarity calculation
export function cosineSimilarity(Q, T) {
    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < Q.length; i++) {
        dot += Q[i] * T[i];
        mag1 += Q[i] * Q[i];
        mag2 += T[i] * T[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;
    return dot / (mag1 * mag2);
}

// Find similar items using vector search
export async function findSimilarItems(query, items, limit = 5) {
    const queryVector = await generateVector(query);
    if (!queryVector) return [];

    const similarities = items.map(item => ({
        ...item,
        similarity: cosineSimilarity(queryVector, item.vector || [])
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, limit);
}