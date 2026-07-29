'use server';

import { search, UnifiedPost } from '@module_3/posts/services/supabase-service';

export async function searchPosts(term: string, community?: string, tags?: string[], filter: string = 'recientes'): Promise<UnifiedPost[]> {
    try {
        if (!term || term.trim() === '') {
            return [];
        }
        
        return await search(term, community, tags, filter);
    } catch (error) {
        console.error("Error al realizar la búsqueda:", error);
        return [];
    }
}