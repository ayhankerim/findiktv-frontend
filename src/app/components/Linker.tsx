import Link from "next/link";

interface NavLink {
  id: number;
  url: string;
  newTab: boolean;
  text: string;
}
interface CustomLinkProps {
  link: NavLink;
  children: React.ReactNode;
}

const Linker = ({ link, children }: CustomLinkProps) => {
  const isInternalLink = link.url.startsWith("/");

  if (isInternalLink) {
    return <Link href={link.url}>{children}</Link>;
  }

  if (link.newTab) {
    return (
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <a href={link.url} target="_self">
      {children}
    </a>
  );
};

export default Linker;
