import type { APIRoute } from 'astro';
import { getPublishedDocs, stripLocale } from '@/lib/navigation';

export async function getStaticPaths() {
  const entries = await getPublishedDocs('en');
  return entries
    .map((entry) => ({
      params: { slug: stripLocale(entry.id) },
      props: { entry },
    }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getPublishedDocs>>[number] };

  const lines = [
    `# ${entry.data.title}`,
    '',
    entry.data.description,
    '',
    entry.body || '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
