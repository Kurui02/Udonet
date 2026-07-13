import { IPostService, ActionResponse } from './types';
import { MockPost } from './mock-data';
import { createPostAction } from '@module_3/posts/actions/post';
import { getThread } from '@module_3/posts/actions/thread';
import { searchPosts } from '@module_3/search/actions/search';

export class MockPostService implements IPostService {
  private static instance: MockPostService | null = null;

  private constructor() {}

  public static getInstance(): MockPostService {
    if (!this.instance) {
      this.instance = new MockPostService();
    }
    return this.instance;
  }

  async getThread(id: string): Promise<MockPost | null> {
    return getThread(id);
  }

  async createPost(formData: FormData): Promise<ActionResponse> {
    return createPostAction(formData);
  }

  async search(term: string, community?: string, tags?: string[], filter?: string): Promise<MockPost[]> {
    return searchPosts(term, community, tags, filter);
  }
}
