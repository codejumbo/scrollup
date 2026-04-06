import type { APIRoute } from 'astro';
import { getPublishedDocs } from '@/lib/navigation';
import { siteConfig, getSiteName } from '@/lib/config';

export const GET: APIRoute = async () => {
  const docs = await getPublishedDocs('en');

  const lines = [
    `# ${getSiteName('en')}`,
    `> ${siteConfig.description}`,
    '',
    '## Docs',
    '',
    ...docs.map((e) => `- [${e.data.title}](${siteConfig.siteUrl}/${e.id}): ${e.data.description}`),
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
