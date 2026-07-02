'use server';

import { mockPublicaciones, PublicacionesMock } from '@/modules/posts/services/datos-falsos';

export async function ObtenerHilo(id: string): Promise<PublicacionesMock | null> {
    try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const hiloEncontrado = mockPublicaciones.find(post => post.id === id);
        
        if (!hiloEncontrado) {
            return null;
        }

        return hiloEncontrado;
    } catch (error) {
        console.error("Error al obtener el hilo:", error);
        return null;
    }
}