import { Post, Reply, PostLink, User, Community } from '@/lib/types';
import { getLinkMetadata } from '../actions/links';
import { createClient } from '@/lib/db/server';

//(eliminar al pasar a la base de datos real)
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
//(eliminar al pasar a la base de datos real)
const DEFAULT_MOCK_COMMUNITY_ID = "00000000-0000-0000-0000-000000000002";
//(eliminar al pasar a la base de datos real)
const MOCK_COMMUNITIES_MAP: Record<string, { name: string; slug: string }> = {
  "00000000-0000-0000-0000-000000000002": { name: "General", slug: "general" },
  "00000000-0000-0000-0000-000000000003": { name: "Computacion", slug: "computacion" },
  "00000000-0000-0000-0000-000000000004": { name: "Prueba 3", slug: "prueba-3" },
};

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export type DatabaseUser = Partial<User> & { id: string; username: string; avatar_url?: string | null };
export type DatabasePostLink = PostLink;

export type DatabaseReply = Reply & {
  author?: DatabaseUser;
  nestedReplies?: DatabaseReply[];
};

export type UnifiedPost = Omit<Post, 'status'> & {
  status: 'open' | 'closed' | 'abierto' | 'cerrado';
  author: DatabaseUser;
  community?: Community;
  community_name?: string;
  tags: string[];
  links: DatabasePostLink[];
  replies: DatabaseReply[];
  votes_count: number;
  replies_count: number;
};

function buildReplyTree(flatReplies: any[]): DatabaseReply[] {
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

export async function getThread(id: string): Promise<UnifiedPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(id, username, avatar_url, reputation, role),
      communities(name),
      links:post_links(*),
      post_tags(tag:tags(name)),
      replies(*, author:users(id, username, avatar_url, reputation, role))
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

  post.replies = buildReplyTree(data.replies || []);

  return post;
}

export async function createPost(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient();

  // Obtener sesión del usuario (Autenticación real)
  const { data: { user } } = await supabase.auth.getUser();
  //if (!user) return { success: false, error: 'Debes iniciar sesión para publicar.' };

  const userId = user?.id || MOCK_USER.id;

  const title = formData.get("title") as string;
  const content = formData.get("postText") as string;
  const detectedUrl = formData.get("detectedUrl") as string;
  const tagsInput = formData.get("tags") as string;

  const communityId = formData.get("communityId") as string || formData.get("community_id") as string || DEFAULT_MOCK_COMMUNITY_ID;
  // (eliminar al pasar a la base de datos real)
  if (!user) {
    await supabase.from('users').upsert({
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      username: MOCK_USER.username,
      is_public: MOCK_USER.is_public,
      role: MOCK_USER.role,
      reputation: MOCK_USER.reputation
    }, { onConflict: 'id' });

    // pruebas mocks para verificar que funcione la select de comunidades al crear (eliminar al pasar a la base de datos real)
    const communityInfo = MOCK_COMMUNITIES_MAP[communityId] || { name: 'General', slug: 'general' };

    await supabase.from('communities').upsert({
      id: communityId,
      name: communityInfo.name,
      slug: communityInfo.slug,
      description: `Comunidad ${communityInfo.name} para pruebas`,
      created_by: userId
    }, { onConflict: 'id' });
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
    console.error("Error insertando post:", postError);
    return { success: false, error: 'Error al crear la publicación.' };
  }

  if (tagsInput) {
    const tagsArray = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    for (const tagName of tagsArray) {
      let { data: existingTag } = await supabase.from('tags').select('id').eq('name', tagName).single();
      let tagId = existingTag?.id;

      if (!tagId) {
        const { data: newTag } = await supabase.from('tags').insert({ name: tagName }).select('id').single();
        tagId = newTag?.id;
      }

      if (tagId) {
        await supabase.from('post_tags').insert({ post_id: newPost.id, tag_id: tagId });
      }
    }
  }

  if (detectedUrl) {
    let linkTitle = null;
    let linkDesc = null;
    let linkImg = null;

    try {
      const metaRes = await getLinkMetadata(detectedUrl) as any;
      if (metaRes.success === 1 && metaRes.meta) {
        linkTitle = metaRes.meta.title;
        linkDesc = metaRes.meta.description;
        linkImg = metaRes.meta.image?.url;
      }
    } catch (e) {
      console.error("Error obteniendo metadata del enlace en el servidor:", e);
    }

    await supabase.from('post_links').insert({
      post_id: newPost.id,
      url: detectedUrl,
      title: linkTitle,
      description: linkDesc,
      image_url: linkImg
    });
  }

  return { success: true, message: '¡Publicación creada exitosamente en la Base de Datos!' };
}

export async function search(term: string = '', community?: string, tags?: string[], filter?: string): Promise<UnifiedPost[]> {
  const supabase = await createClient();

  const cleanTerm = term?.startsWith('#') ? term.slice(1).trim() : term?.trim() || '';

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users(id, username, avatar_url, reputation, role),
      communities(name),
      post_tags(tag:tags(name)),
      replies(id)
    `)
    .eq('is_hidden', false);

  if (cleanTerm) {
    // Buscar si hay tags con ese nombre
    const { data: matchedTags } = await supabase
      .from('tags')
      .select('id')
      .ilike('name', `%${cleanTerm}%`);

    const matchedTagIds = matchedTags?.map((t: any) => t.id) || [];
    let matchedPostIdsFromTags: string[] = [];

    if (matchedTagIds.length > 0) {
      const { data: ptData } = await supabase
        .from('post_tags')
        .select('post_id')
        .in('tag_id', matchedTagIds);

      matchedPostIdsFromTags = ptData?.map((pt: any) => pt.post_id) || [];
    }

    // Coincidir por título
    if (matchedPostIdsFromTags.length > 0) {
      const idList = matchedPostIdsFromTags.join(',');
      query = query.or(`title.ilike.%${cleanTerm}%,content.ilike.%${cleanTerm}%,id.in.(${idList})`);
    } else {
      query = query.or(`title.ilike.%${cleanTerm}%,content.ilike.%${cleanTerm}%`);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

  if (error || !data) return [];

  let formattedData: UnifiedPost[] = data.map((post: any) => ({
    ...post,
    community_name: post.communities?.name || 'General',
    tags: post.post_tags?.map((pt: any) => pt.tag.name) || [],
    replies: [],
    links: [],
    replies_count: post.replies ? post.replies.length : 0,
    votes_count: 0 // En 0 hasta tener los datos del modulo 4
  }));

  // Ordenar por el filtro seleccionado
  if (filter === 'respondidos') {
    formattedData.sort((a, b) => b.replies_count - a.replies_count);
  } else if (filter === 'votados') {
    formattedData.sort((a, b) => b.votes_count - a.votes_count);
  } else {
    formattedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return formattedData.slice(0, 20);
}

export async function getPosts(filter?: string): Promise<UnifiedPost[]> {
  return search("", undefined, undefined, filter);
}

export async function addReply(postId: string, parentId: string | null, content: string): Promise<ActionResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  //if (!user) return { success: false, error: 'Debes iniciar sesión para responder.' };

  const userId = user?.id || MOCK_USER.id;

  if (!user) {
    await supabase.from('users').upsert({
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      username: MOCK_USER.username,
      is_public: MOCK_USER.is_public,
      role: MOCK_USER.role,
      reputation: MOCK_USER.reputation
    }, { onConflict: 'id' });
  }

  const { error } = await supabase.from('replies').insert({
    content,
    post_id: postId,
    parent_id: parentId,
    user_id: userId
  });

  if (error) {
    console.error("Error insertando respuesta:", error);
    return { success: false, error: 'No se pudo guardar la respuesta.' };
  }

  return { success: true, message: 'Respuesta guardada con éxito.' };
}

export async function getPostsByUser(userId: string): Promise<UnifiedPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(id, username, avatar_url, reputation, role),
      communities(name),
      post_tags(tag:tags(name)),
      replies(id)
    `)
    .eq('author_id', userId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((post: any) => ({
    ...post,
    community_name: post.communities?.name || 'General',
    tags: post.post_tags?.map((pt: any) => pt.tag.name) || [],
    replies: [],
    links: [],
    replies_count: post.replies ? post.replies.length : 0,
    votes_count: 0
  }));
}