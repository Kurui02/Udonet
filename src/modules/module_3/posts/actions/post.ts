"use server";

import { revalidatePath } from "next/cache";
import { createPost, getPosts, UnifiedPost } from "@module_3/posts/services/supabase-service";
import { 
  getUserMainCommunities, 
  getCommunityBySlug,
  isUserSubscribed 
} from "@module_2/exports";

export interface CommunityOption {
  id: string;
  name: string;
}

export async function getUserJoinedCommunitiesAction(): Promise<CommunityOption[]> {
  try {
    const mainCommunities = await getUserMainCommunities();

    return (mainCommunities || []).map((community) => ({
      id: community.id,
      name: community.name,
    }));
  } catch (error) {
    console.error("Error al obtener las comunidades del usuario:", error);

    try {
      const generalCommunity = await getCommunityBySlug("temas-general");
      if (generalCommunity) {
        return [{ id: generalCommunity.id, name: generalCommunity.name }];
      }
    } catch (fallbackError) {
      console.error("Error al buscar la comunidad General:", fallbackError);
    }

    return [];
  }
}

export async function createPostAction(formData: FormData) {
  try {
    // Extraemos el ID de la comunidad enviada desde el formulario
    const communityId = (formData.get("community_id") || formData.get("communityId"))?.toString();

    if (!communityId) {
      return { success: false, error: "Debes seleccionar una comunidad válida." };
    }

    // Verificamos membresía activa con la función exportada del Módulo 2
    const hasMembership = await isUserSubscribed(communityId);

    if (!hasMembership) {
      return { 
        success: false, 
        error: "Debes estar suscrito a esta comunidad para poder publicar en ella." 
      };
    }

    const result = await createPost(formData);

    if (result.success) {
      revalidatePath("/");
    }
    return result;
  } catch (error) {
    console.error("Error en createPostAction:", error);
    return { success: false, error: "Error interno al conectar con la base de datos." };
  }
}

export async function getPostsAction(filter?: string): Promise<UnifiedPost[]> {
  try {
    return await getPosts(filter);
  } catch (error) {
    console.error("Error en getPostsAction:", error);
    return [];
  }
}