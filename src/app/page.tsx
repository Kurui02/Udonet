import { Module3Container } from "@module_3/exports";
import { getPostsAction, getUserJoinedCommunitiesAction } from "@module_3/posts/actions/post";
import { searchPosts } from "@module_3/search/actions/search";

interface HomeProps {
  searchParams: Promise<{ q?: string; filter?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';
  const filter = resolvedParams?.filter || 'most_replied';

  const tags = query.includes(',')
    ? query.split(',').map(t => t.trim().toLowerCase())
    : [];

  const [initialPosts, communities] = await Promise.all([
    query.trim() !== ''
      ? searchPosts(query, undefined, tags, filter)
      : getPostsAction(filter),
    getUserJoinedCommunitiesAction(),
  ]);

  return (
    <main className="bg-gray-blue min-h-screen p-4 sm:p-8">
      <Module3Container initialPosts={initialPosts} communities={communities} />
    </main>
  );
}