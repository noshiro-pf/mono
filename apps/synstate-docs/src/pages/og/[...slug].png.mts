import { type APIRoute, type GetStaticPaths } from 'astro';
// @ts-expect-error -- astro:content is a virtual module available only at Astro build time
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../lib/index.mjs';

export const getStaticPaths: GetStaticPaths = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const docs = await getCollection('docs');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return docs.map(
    (
      entry: Readonly<{
        id: string;
        data: Readonly<{ title: string; description?: string }>;
      }>,
    ) => ({
      params: { slug: entry.id },
      props: {
        title: entry.data.title,
        description: entry.data.description,
      },
    }),
  );
};

export const GET: APIRoute = async ({ props }) => {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const { title, description } = props as Readonly<{
    title: string;
    description: string | undefined;
  }>;

  const png = await generateOgImage(title, description);

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return new Response(png as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
