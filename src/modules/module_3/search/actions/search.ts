'use server';

import { SupabasePostService } from '@module_3/posts/services/supabase-service';
import { UnifiedPost } from '@module_3/posts/services/types';

export async function searchPosts(term: string, community?: string, tags?: string[], filter: string = 'recientes'): Promise<UnifiedPost[]> {
    try {
        if (!term || term.trim() === '') {
            return [];
        }
        
        const service = SupabasePostService.getInstance();
        return await service.search(term, community, tags, filter);
    } catch (error) {
        console.error("Error al realizar la búsqueda:", error);
        return [];
    }
}