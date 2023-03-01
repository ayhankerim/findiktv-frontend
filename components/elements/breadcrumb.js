import React from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { MdChevronRight } from "react-icons/md"

const Breadcrumb = ({ items }) => {
  const { locale } = useRouter()
  return (
    <div className="Breadcrumb pb-2 text-sm text-midgray">
      <meta itemProp="numberOfItems" content={items.length + 1} />
      <ul className="flex overflow-x-auto">
        <li
          itemProp="itemListElement"
          itemScope=""
          itemType="http://schema.org/ListItem"
          className="flex-none"
        >
          <meta itemProp="position" content="1" />
          <span
            itemProp="item"
            itemScope=""
            itemType="http://schema.org/WebPage"
            itemID="/"
          >
            <Link
              href={`/`}
              passHref
              className="hover:underline underline-offset-4 hover:text-darkgray"
              itemProp="url"
            >
              <span itemProp="name">FINDIK TV</span>
            </Link>
          </span>
          <MdChevronRight className="inline-block" />
        </li>
        {items.slice(0, -1).map((item, i) => (
          <li
            key={i}
            itemProp="itemListElement"
            itemScope=""
            itemType="http://schema.org/ListItem"
            className="flex-none"
          >
            <meta itemProp="position" content={i + 2} />
            <span
              itemProp="item"
              itemScope=""
              itemType="http://schema.org/WebPage"
              itemID={item.slug}
            >
              <Link
                href={item.slug}
                className="hover:underline underline-offset-4 hover:text-darkgray"
                itemProp="url"
                passHref
              >
                <span itemProp="name">{item.title}</span>
              </Link>
            </span>
            <MdChevronRight className="inline-block" />
          </li>
        ))}
        <li
          itemProp="itemListElement"
          itemScope=""
          itemType="http://schema.org/ListItem"
          className="flex-none"
        >
          <meta itemProp="position" content={items.length + 1} />
          <span
            itemProp="item"
            itemScope=""
            itemType="http://schema.org/WebPage"
            itemID={`${items[items.length - 1].slug}`}
          >
            <span itemProp="name">
              {items[items.length - 1].title.toLocaleUpperCase(locale)}
            </span>
          </span>
        </li>
      </ul>
    </div>
  )
}

export default Breadcrumb
