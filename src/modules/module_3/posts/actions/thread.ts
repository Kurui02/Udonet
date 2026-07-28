'use server';

import { SupabasePostService } from '@module_3/posts/services/supabase-service';
import { UnifiedPost } from '@module_3/posts/services/types';

export async function getThread(id: string): Promise<UnifiedPost | null> {
    try {
        const service = SupabasePostService.getInstance();
        return await service.getThread(id);
    } catch (error) {
        console.error("Error al obtener el hilo:", error);
        return null;
    }
}