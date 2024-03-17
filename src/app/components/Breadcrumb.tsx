import React from "react";
import Link from "next/link";
import { MdChevronRight } from "react-icons/md";

interface BreadcrumbItem {
  slug: string;
  title: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
const BreadcrumbItem = ({
  item,
  i,
  total,
}: {
  item: BreadcrumbItem;
  i: number;
  total: number;
}) => {
  return (
    <li
      itemProp="itemListElement"
      itemScope={"" || undefined}
      itemType="http://schema.org/ListItem"
      className="flex-none"
    >
      <meta itemProp="position" content={String(i + 1)} />
      <span
        itemProp="item"
        itemScope={"" || undefined}
        itemType="http://schema.org/WebPage"
        itemID={item.slug}
      >
        {total != i + 1 ? (
          <Link
            href={item.slug}
            className="hover:underline underline-offset-4 hover:text-darkgray"
            itemProp="url"
            passHref
          >
            <span itemProp="name">{item.title}</span>
          </Link>
        ) : (
          <span itemProp="name">{item.title}</span>
        )}
      </span>
      {total != i + 1 && <MdChevronRight className="inline-block" />}
    </li>
  );
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="Breadcrumb pb-2 text-sm text-midgray"
    >
      <meta itemProp="numberOfItems" content={String(items.length)} />
      <ol className="flex overflow-x-auto">
        {items.map((item, i) => (
          <BreadcrumbItem
            key={i}
            total={items.length}
            i={i}
            item={item}
          ></BreadcrumbItem>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
