import { Metadata } from 'next';
import qs from 'qs';

import PageContent from '@/lib/shared/PageContent';
import fetchContentType from '@/lib/strapi/fetchContentType';
import { generateMetadataObject } from '@/lib/shared/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const query = qs.stringify(
    {
      filters: {
        slug: {
          $eq: "homepage",
        },
      },
      populate: ["metadata"]
    },
    {
      encodeValuesOnly: true,
    }
  );
  const pageData = await fetchContentType(
    'pages',
    query,
    true
  );

  const seo = pageData?.metadata;
  const metadata = generateMetadataObject(seo);
  return metadata;
}

export default async function HomePage() {
  const query = qs.stringify(
    {
      filters: {
        slug: {
          $eq: "homepage",
        },
      },
      populate: ["contentSections"]
    },
    {
      encodeValuesOnly: true,
    }
  );
  const pageData = await fetchContentType(
    'pages',
    query,
    true
  );

  return <PageContent pageData={pageData} />;
}
