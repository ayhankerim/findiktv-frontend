import { sectionRenderer } from "@/utils/section-renderer";
import { Metadata } from "next";
import { getPageBySlug } from "@/utils/get-page-by-slug";
import { FALLBACK_SEO } from "@/utils/constants";
import { notFound } from "next/navigation";

type Props = {
  params: {
    lang: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug(params.slug, "tr");

  if (!page.data[0]?.seo) return FALLBACK_SEO;
  const metadata = page.data[0].seo;

  return {
    title: metadata.metaTitle,
    description: metadata.metaDescription,
  };
}

export default async function PageRoute({ params }: Props) {
  const page = await getPageBySlug(params.slug, "tr");
  if (page.data.length === 0) return notFound();
  const contentSections = page.data[0].contentSections;
  return contentSections.map((section: any, index: number) =>
    sectionRenderer(section, index)
  );
}
