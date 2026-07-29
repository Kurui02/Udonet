'use server';

import { revalidatePath } from 'next/cache';
import { addReply } from '@module_3/posts/services/supabase-service';

export async function addReplyAction(postId: string, parentId: string | null, content: string) {
    try {
        if (!content || !content.trim()) {
            return { success: false, error: "El contenido no puede estar vacío." };
        }

        const result = await addReply(postId, parentId, content);

        if (result.success) {
            const mentionRegex = /@([\w_]+)/g;
            let match;
            const mentionedUsers: string[] = [];

            while ((match = mentionRegex.exec(content.trim())) !== null) {
                mentionedUsers.push(match[1]); 
            }

            if (mentionedUsers.length > 0) {
                
                // import y await de notificaciones de las menciones Modulo 4
                console.log("Usuarios mencionados detectados (Pendiente Módulo 4):", mentionedUsers);
            }

            revalidatePath("/");
        }
        return result;
    } catch (error) {
        console.error("Error al guardar respuesta:", error);
        return { success: false, error: "No se pudo guardar la respuesta en la base de datos." };
    }

}