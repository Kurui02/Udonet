import { MockPost } from './mock-data';

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface IPostService {
  getThread(id: string): Promise<MockPost | null>;
  createPost(formData: FormData): Promise<ActionResponse>;
  search(term: string, community?: string, tags?: string[], filter?: string): Promise<MockPost[]>;
}
