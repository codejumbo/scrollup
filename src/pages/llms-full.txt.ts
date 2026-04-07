import type { APIRoute } from 'astro';
import { getPublishedDocs } from '@/lib/navigation';
import { siteConfig } from '@/lib/config';

export const GET: APIRoute = async () => {
  const docs = await getPublishedDocs('en');

  const sections = docs.map((e) => [
    `# ${e.data.title}`,
    `> ${e.data.description}`,
    `> URL: ${siteConfig.siteUrl}/${e.id}`,
    '',
    e.body || '',
  ].join('\n'));

  return new Response(sections.join('\n\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
