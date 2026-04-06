import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedDocs } from '@/lib/navigation';
import { siteConfig, getSiteName } from '@/lib/config';

export async function GET(context: APIContext) {
  const docs = (await getPublishedDocs('en'))
    .sort((a, b) => {
      const dateA = a.data.lastUpdated ? new Date(a.data.lastUpdated).getTime() : 0;
      const dateB = b.data.lastUpdated ? new Date(b.data.lastUpdated).getTime() : 0;
      return dateB - dateA;
    });

  return rss({
    title: getSiteName('en'),
    description: siteConfig.description,
    site: context.site!.toString(),
    items: docs.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      link: `/${entry.id}/`,
      pubDate: entry.data.lastUpdated ? new Date(entry.data.lastUpdated) : undefined,
    })),
  });
}
