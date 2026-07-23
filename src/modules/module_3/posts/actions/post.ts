"use server";

import { revalidatePath } from "next/cache";
import { getLinkMetadata } from "@module_3/posts/actions/links"; 
import { mockPosts, MockPost,MockReply, getRandomUserProfile } from "@module_3/posts/services/mock-data"; 
import { PostServiceFactory } from "@module_3/posts/services/factory";
import fs from "fs/promises";
import path from "path";

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const MAX_FILE_SIZE = 4194304; // 4MB en Bytes
const JSON_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "modules",
  "module_3",
  "posts",
  "services",
  "mock-posts-extra.json"
);

export async function createPostAction(formData: FormData): Promise<ActionResponse> {
  try {
    const title = (formData.get("title") as string) || "";
    const postText = (formData.get("postText") as string) || "";
    const detectedUrl = (formData.get("detectedUrl") as string) || "";
    const tagsInput = (formData.get("tags") as string) || "";
    const file = formData.get("file") as File | null;

    if (!title.trim()) {
      return { success: false, error: "El título de la publicación es obligatorio." };
    }

    // 1. Validación del texto del post
    if (!postText.trim()) {
      return { success: false, error: "El texto del post no puede estar vacío." };
    }

    // 2. Validación de etiquetas (Tags)
    if (!tagsInput.trim()) {
      return { success: false, error: "Es obligatorio ingresar al menos un tag." };
    }

    const tagsArray = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tagsArray.length === 0) {
      return { success: false, error: "Formato de tags inválido. Usa comas para separar." };
    }

    // 3. Validación de archivos
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: "El archivo excede el tamaño máximo de 4MB." };
      }
    }

    // 4. Obtención y procesamiento de metadatos de URL
    let finalMetadata = null;
    const cleanUrl = detectedUrl.trim();

    if (cleanUrl) {
      try {
        const metaResult = (await getLinkMetadata(cleanUrl)) as {
          success?: number;
          meta?: any;
        };

        if (metaResult && metaResult.success === 1 && metaResult.meta) {
          finalMetadata = metaResult.meta;
        }
      } catch (err) {
        console.warn("No se pudieron obtener los metadatos de la URL, pero el link se conservará:", err);
      }
    }

    // 5. Perfil de usuario dinámico/simulado
    const authorProfile = await getRandomUserProfile();

    // 6. Construcción del objeto de la nueva publicación
    const newPost: MockPost = {
      id: `post_${crypto.randomUUID().substring(0, 8)}`,
      title: title.trim(),
      content: postText,
      community: "General",
      tags: tagsArray,
      author: { username: authorProfile.username },
      createdAt: new Date(),
      votes: 0,
      repliesCount: 0,
      status: "Abierto" as const,
      replies: [],
      links: cleanUrl ? [cleanUrl] : [], // Guarda siempre la URL en el array si fue ingresada
      linkMetadata: finalMetadata        // Guarda los metadatos del scraper o null
    };

    // 7. Persistencia de datos en el archivo JSON
    let extraPosts: MockPost[] = [];
    try {
      const contenidoJson = await fs.readFile(JSON_FILE_PATH, "utf-8");
      extraPosts = JSON.parse(contenidoJson);
    } catch (readError) {
      const err = readError as { code?: string };
      // Si el archivo JSON no existe aún, se inicializa como lista vacía
      if (err.code !== "ENOENT") throw readError;
    }

    extraPosts.push(newPost);
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(extraPosts, null, 2), "utf-8");

    // 8. Actualización del estado en memoria y revalidación de Next.js
    mockPosts.push(newPost);
    revalidatePath("/");

    return { success: true, message: "Post creado correctamente." };

  } catch (error) {
    console.error("Error en createPostAction:", error);
    return { success: false, error: "Error interno en el servidor." };
  }
}

export async function getPostsAction(filter?: string): Promise<MockPost[]> {
  try {
    const service = PostServiceFactory.getService();
    return await service.getPosts(filter);
  } catch (error) {
    console.error("Error en getPostsAction:", error);
    return [];
  }
}

