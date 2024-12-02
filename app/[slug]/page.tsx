import { Metadata } from "next";
import qs from "qs";
import { notFound } from 'next/navigation'
import PageContent from "@/lib/shared/PageContent";
import fetchContentType from "@/lib/strapi/fetchContentType";
import { generateMetadataObject } from "@/lib/shared/metadata";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const query = qs.stringify(
    {
      filters: {
        slug: {
          $eq: params.slug,
        },
      },
      populate: ["metadata"],
    },
    {
      encodeValuesOnly: true,
    }
  );
  const pageData = await fetchContentType("pages", query, true);

  const seo = pageData?.metadata;
  const metadata = generateMetadataObject(seo);
  return metadata;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const query = qs.stringify(
    {
      filters: {
        slug: {
          $eq: params.slug,
        },
      },
      populate: ["contentSections"],
    },
    {
      encodeValuesOnly: true,
    }
  );
  const pageData = await fetchContentType("pages", query, true);
  if(!pageData) {
    notFound()
  }
  return <PageContent pageData={pageData} />;
}
