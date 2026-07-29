import { PostService, ActionResponse, UnifiedPost, DatabaseReply } from './types';
import { getLinkMetadata } from '../actions/links';
import { createClient } from '@/lib/db/server'; 

const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@test.com',
  username: 'testuser',
  avatar_url: null,
  bio: null,
  is_public: true,
  role: 'regular',
  reputation: 150,
  created_at: new Date().toISOString(),
};

const DEFAULT_MOCK_COMMUNITY_ID = "00000000-0000-0000-0000-000000000002";

export class SupabasePostService implements PostService {
  private static instance: SupabasePostService | null = null;

  private constructor() {}

  public static getInstance(): SupabasePostService {
    if (!this.instance) {
      this.instance = new SupabasePostService();
    }
    return this.instance;
  }

  async getThread(id: string): Promise<UnifiedPost | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, avatar_url),
        communities(name),
        links:post_links(*),
        post_tags(tag:tags(name)),
        replies(*, author:users(id, username, avatar_url))
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error en Supabase getThread:', error);
      return null;
    }

    const formattedTags = data.post_tags?.map((pt: any) => pt.tag.name) || [];

    const post: UnifiedPost = {
      ...data,
      community_name: data.communities?.name || 'General',
      tags: formattedTags,
      replies_count: data.replies?.length || 0,
      votes_count: 0 // Conectar con módulo 4 
    };

    post.replies = this.buildReplyTree(data.replies || []);

    return post;
  }

  async createPost(formData: FormData): Promise<ActionResponse> {
    const supabase = await createClient();
    
    // Obtener sesión del usuario (Autenticación real)
    const { data: { user } } = await supabase.auth.getUser();
    
    const userId = user?.id || MOCK_USER.id;

    const title = formData.get("title") as string;
    const content = formData.get("postText") as string;
    const detectedUrl = formData.get("detectedUrl") as string;
    const tagsInput = formData.get("tags") as string;

    let communityId = formData.get("communityId") as string;
    if (!communityId || communityId === "General") {
      communityId = DEFAULT_MOCK_COMMUNITY_ID;
    }

    const { data: newPost, error: postError } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        author_id: userId,
        community_id: communityId,
        status: 'open'
      })
      .select()
      .single();

      if (postError) {
        console.error("Error REAL insertando post:", postError);
        return { success: false, error: 'Error BD: ' + postError.message };
    }

    if (detectedUrl) {
      await supabase.from('post_links').insert({
        post_id: newPost.id,
        url: detectedUrl
      });
    }

    return { success: true, message: '¡Publicación creada exitosamente en la Base de Datos!' };
  }

  async search(term: string, community?: string, tags?: string[], filter?: string): Promise<UnifiedPost[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username),
        communities(name),
        post_tags(tag:tags(name))
      `)
      .eq('is_hidden', false);

    if (term) {
      query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(20);

    if (error || !data) return [];

    return data.map((post: any) => ({
      ...post,
      community_name: post.communities?.name || 'General',
      tags: post.post_tags?.map((pt: any) => pt.tag.name) || [],
      replies: [],
      links: []
    }));
  }

  async getPosts(filter?: string): Promise<UnifiedPost[]> {
    return this.search("", undefined, undefined, filter);
  }

  async addReply(postId: string, parentId: string | null, content: string): Promise<ActionResponse> {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const userId = user?.id || MOCK_USER.id;

    const { error } = await supabase.from('replies').insert({
      content,
      post_id: postId,
      parent_id: parentId,
      user_id: userId
    });

    if (error) {
      console.error("Error REAL insertando respuesta:", error);
      return { success: false, error: 'Error BD: ' + error.message };
  }
    
    return { success: true, message: 'Respuesta guardada con éxito.' };
  }

  private buildReplyTree(flatReplies: any[]): DatabaseReply[] {
    const replyMap = new Map<string, DatabaseReply>();
    const roots: DatabaseReply[] = [];

    flatReplies.forEach(r => {
      replyMap.set(r.id, { ...r, nestedReplies: [] });
    });

    flatReplies.forEach(r => {
      const node = replyMap.get(r.id)!;
      if (r.parent_id) {
        const parent = replyMap.get(r.parent_id);
        if (parent) parent.nestedReplies!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}