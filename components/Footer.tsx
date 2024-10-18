"use client";
import Logo from "./Logo";
import Linker from "./Linker";

interface Columns {
  title: string;
  links: Array<FooterLink>;
}

interface FooterLink {
  id: number;
  url: string;
  text: string;
  newTab: boolean;
  marked: boolean;
}
function FooterLink(link: FooterLink) {
  return (
    <li
      key={link.id}
      className="text-lightgray py-1 px-1 -mx-1 hover:underline"
    >
      <Linker link={link}>{link.text}</Linker>
    </li>
  );
}

export default function Footer({
  logoUrl,
  columns,
  smallText,
  copyright,
}: {
  logoUrl: string | null;
  columns: Array<Columns>;
  smallText: string | null;
  copyright: string | TrustedHTML;
}) {
  return (
    <footer className="pt-12 bg-black/95 border-t-[10px] border-primary">
      <div className="container flex flex-col lg:flex-row lg:justify-between">
        <Logo src={logoUrl} />
        <nav className="flex flex-wrap flex-row lg:gap-20 items-start lg:justify-end mb-10">
          {columns.map((footerColumn, i) => (
            <div key={i} className="mt-10 lg:mt-0 w-6/12 lg:w-auto">
              <h3 className="uppercase tracking-wide font-semibold text-midgray">
                {footerColumn.title}
              </h3>
              <ul className="mt-2">
                {footerColumn.links.map((link) => (
                  <FooterLink {...link} key={link.id} />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="text-sm py-6 text-lightgray/60 bg-black">
        <div className="container flex flex-col sm:flex-row justify-between gap-2">
          <div className="">{smallText}</div>
          <div dangerouslySetInnerHTML={{ __html: copyright }} />
        </div>
      </div>
    </footer>
  );
}
