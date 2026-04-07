import type { APIRoute } from 'astro';
import { getPublishedDocs } from '@/lib/navigation';

export const GET: APIRoute = async () => {
  const docs = (await getPublishedDocs('en'))
    .filter((e) => e.data.searchable !== false)
    .map((e) => ({
      title: e.data.title,
      description: e.data.description,
      section: e.data.section,
      slug: e.data.slug ?? e.id,
      body: e.body?.slice(0, 500) || '',
    }));

  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json' },
  });
};
