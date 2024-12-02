import React from "react";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { Link } from "next-view-transitions";

export const Footer = async ({
  data,
  locale,
}: {
  data: any;
  locale: string;
}) => {
  return (
    <footer className="pt-12 bg-black/95 border-t-[10px] border-primary">
      <Container className="flex flex-col lg:flex-row lg:justify-between">
        <div>
          {data?.logo && <Logo image={data?.logo} width={120} height={48} />}
        </div>
        <nav className="flex flex-wrap flex-row lg:gap-20 items-start lg:justify-end mb-10">
          {data?.columns.length > 0 &&
            data?.columns.map((footerColumn: any) => (
              <div
                key={footerColumn.id}
                className="mt-10 lg:mt-0 w-6/12 lg:w-auto"
              >
                <h3 className="uppercase tracking-wide font-semibold text-midgray">
                  {footerColumn.title}
                </h3>
                <ul className="mt-2">
                  <LinkSection links={footerColumn.links} locale={locale} />
                </ul>
              </div>
            ))}
        </nav>
      </Container>
      <div className="text-sm py-6 text-lightgray/60 bg-black">
        <Container className="flex flex-col sm:flex-row justify-between gap-2">
            <div>{data?.smallText}</div>
            <div dangerouslySetInnerHTML={{ __html: data?.copyright }} />
        </Container>
      </div>
    </footer>
  );
};

const LinkSection = ({
  links,
  locale,
}: {
  links: { text: string; url: never | string }[];
  locale: string;
}) => (
  <li className="text-lightgray py-1 px-1 -mx-1 hover:underline">
    {links.map((link) => (
      <Link
        key={link.text}
        className="transition-colors hover:text-neutral-400 text-muted text-xs sm:text-sm"
        href={`${link.url.startsWith("http") ? "" : `/${locale}`}${link.url}`}
      >
        {link.text}
      </Link>
    ))}
  </li>
);
