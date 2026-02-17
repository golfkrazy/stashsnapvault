import supabase from '../supabase';

export type SearchType = 'item' | 'location' | 'category';

export interface SearchOptions {
    searchType: SearchType;
    limit?: number;
    threshold?: number;
}

export interface SearchResult {
    id: string;
    item_id: string;
    content: string;
    similarity: number;
}

export async function performSemanticSearch(
    query: string,
    userId: string,
    options: SearchOptions
): Promise<SearchResult[]> {
    try {
        console.log(`[Semantic Search] Searching for: "${query}" (${options.searchType})`);

        // 1. Generate Embedding for the query using Edge Function (Nomic v1.5)
        const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
            body: {
                text: query,
                task: 'search_query'
            }
        });

        if (embeddingError) {
            console.error('[Semantic Search] Embedding generation failed:', embeddingError);
            throw new Error('Failed to generate search embedding');
        }

        const queryEmbedding = embeddingData.embedding;

        // 2. Call RPC to find matching items
        const { data: matchData, error: matchError } = await supabase.rpc('match_items', {
            query_embedding: queryEmbedding,
            match_threshold: options.threshold || 0.5, // Default threshold
            match_count: options.limit || 10
        });

        if (matchError) {
            console.error('[Semantic Search] RPC match_items failed:', matchError);
            throw matchError;
        }

        return matchData || [];

    } catch (error) {
        console.error('[Semantic Search] Error:', error);
        throw error;
    }
}
