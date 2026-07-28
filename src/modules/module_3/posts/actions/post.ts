"use server";

import { revalidatePath } from "next/cache";
import { SupabasePostService } from "@module_3/posts/services/supabase-service";
import { UnifiedPost } from "@module_3/posts/services/types";

export interface CommunityOption {
  id: string;
  name: string;
}

export async function getUserJoinedCommunitiesAction(): Promise<CommunityOption[]> {
  try {
    //  Aqui modulo 2(comunidades que el usuario sigue)
   
    return [
      { id: "General", name: "General" }
    ];
  } catch (error) {
    console.error("Error al obtener las comunidades del usuario:", error);
    return [{ id: "General", name: "General" }];
  }
}

export async function createPostAction(formData: FormData){
  try {
      const service = SupabasePostService.getInstance();
      const result = await service.createPost(formData);

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
    const service = SupabasePostService.getInstance();
    return await service.getPosts(filter);
  } catch (error) {
    console.error("Error en getPostsAction:", error);
    return [];
  }
}

