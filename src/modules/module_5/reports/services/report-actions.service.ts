import { createClient } from "@/lib/db/server";
import { User } from "@/lib/types";
<<<<<<< HEAD
import { TargetType } from "@/lib/types/report";
import { verifyModeratorPermission } from "@module_5/moderation/exports";

export async function getActiveReportsCount(target_id: string, target_type: TargetType): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("target_id", target_id)
    .eq("target_type", target_type)
    .eq("status", "pending");

  if (error) throw new Error(`Failed to fetch report count: ${error.message}`);
  return count || 0;
}

export async function updateContentVisibility(
  target_id: string, 
  target_type: TargetType, 
  moderator: User
): Promise<void> {
  const auth = verifyModeratorPermission(moderator);
  if (!auth.isAuthorized) throw new Error(auth.reason);

  const supabase = await createClient();
  const tableName = target_type === "post" ? "posts" : target_type === "reply" ? "replies" : null;
  if (!tableName) throw new Error("Invalid target type for content hiding.");

  const { error: hideError } = await supabase
    .from(tableName)
    .update({ is_hidden: true })
    .eq("id", target_id);

  if (hideError) throw new Error(`Failed to hide content: ${hideError.message}`);

  const { error: reportError } = await supabase
    .from("reports")
    .update({ status: "approved" })
    .eq("target_id", target_id)
    .eq("target_type", target_type);

  if (reportError) throw new Error(`Failed to resolve reports: ${reportError.message}`);

  if (target_type === "post") {
    const { data: postData } = await supabase.from("posts").select("author_id").eq("id", target_id).single();
    if (postData?.author_id) {
      const expires = new Date(Date.now() + 86400000).toISOString();
      await supabase.from("warnings").insert({
        user_id: postData.author_id,
        moderator_id: moderator.id,
        type: "approved_report",
        reason: "Post hidden due to report approval",
        expires_at: expires
      });
    }
  }
}

export async function updateReportsStatus(
  target_id: string, 
  target_type: TargetType, 
  moderator: User
): Promise<void> {
  const auth = verifyModeratorPermission(moderator);
  if (!auth.isAuthorized) throw new Error(auth.reason);

  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: "rejected" })
    .eq("target_id", target_id)
    .eq("target_type", target_type);

  if (error) throw new Error(`Failed to reject reports: ${error.message}`);
=======
import { TargetType, ReportStatus } from "@/lib/types/report";
import { verifyModeratorPermission } from "@module_5/moderation/exports";

export class ReportActionsService {
  /**
   * Obtiene la cantidad de reportes activos (pendientes) para un contenido específico.
   * Permite al frontend decidir si muestra un banner de advertencia visual.
   * @param target_id - ID de la publicación, respuesta o perfil reportado.
   * @param target_type - Tipo de contenido ("post", "reply", "user", "community").
   * @returns Número entero de reportes pendientes.
   */
  public async getActiveReportsCount(target_id: string, target_type: TargetType): Promise<number> {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("target_id", target_id)
      .eq("target_type", target_type)
      .eq("status", "pendiente" as ReportStatus);

    if (error) throw new Error(`Failed to fetch report count: ${error.message}`);
    return count || 0;
  }

  /**
   * Actualiza la visibilidad de un contenido reportado tras la revisión del moderador.
   * Marca los reportes asociados como 'approved'.
   * @param target_id - ID del contenido a ocultar.
   * @param target_type - Tipo de contenido ("post" o "reply").
   * @param moderator - Moderador que realiza la acción.
   */
  public async updateContentVisibility(
    target_id: string, 
    target_type: TargetType, 
    moderator: User
  ): Promise<void> {
    const auth = verifyModeratorPermission(moderator);
    if (!auth.isAuthorized) throw new Error(auth.reason);

    const supabase = await createClient();
    const tableName = target_type === "post" ? "posts" : target_type === "reply" ? "replies" : null;
    if (!tableName) throw new Error("Invalid target type for content hiding.");

    const { error: hideError } = await supabase
      .from(tableName)
      .update({ is_hidden: true })
      .eq("id", target_id);

    if (hideError) throw new Error(`Failed to hide content: ${hideError.message}`);

    const { error: reportError } = await supabase
      .from("reports")
      .update({ status: "aprobado" as ReportStatus })
      .eq("target_id", target_id)
      .eq("target_type", target_type);

    if (reportError) throw new Error(`Failed to resolve reports: ${reportError.message}`);
  }

  /**
   * Actualiza el estado de los reportes a 'rejected' si el moderador decide que no hay infracción.
   * @param target_id - ID del contenido reportado.
   * @param target_type - Tipo de contenido.
   * @param moderator - Moderador.
   */
  public async updateReportsStatus(
    target_id: string, 
    target_type: TargetType, 
    moderator: User
  ): Promise<void> {
    const auth = verifyModeratorPermission(moderator);
    if (!auth.isAuthorized) throw new Error(auth.reason);

    const supabase = await createClient();
    
    const { error } = await supabase
      .from("reports")
      .update({ status: "rechazado" as ReportStatus })
      .eq("target_id", target_id)
      .eq("target_type", target_type);

    if (error) throw new Error(`Failed to reject reports: ${error.message}`);
  }
>>>>>>> 7d98592f2c66806499106dae9832c3d8060338c2
}