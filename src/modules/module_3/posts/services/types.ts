
export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DatabaseUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface DatabasePostLink {
  id: string;
  post_id: string;
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface DatabaseReply {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  vote_count: number;
  is_edited: boolean;
  is_hidden: boolean;
  created_at: string;
  edited_at: string | null;
  author?: DatabaseUser; 
  nestedReplies?: DatabaseReply[]; 
}

export interface UnifiedPost {
  id: string;
  title: string;
  content: string | null;
  author_id: string;
  community_id: string;
  status: 'open' | 'closed'; 
  is_pinned: boolean;
  is_private: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;

  author: DatabaseUser;
  community_name?: string;
  tags: string[]; 
  links: DatabasePostLink[];
  replies: DatabaseReply[];
  votes_count: number; 
  replies_count: number;
}

export interface PostService {
  getThread(id: string): Promise<UnifiedPost | null>;
  createPost(formData: FormData): Promise<ActionResponse>;
  search(term: string, community?: string, tags?: string[], filter?: string): Promise<UnifiedPost[]>;
  getPosts(filter?: string): Promise<UnifiedPost[]>;
  addReply(postId: string, parentId: string | null, content: string): Promise<ActionResponse>;
}