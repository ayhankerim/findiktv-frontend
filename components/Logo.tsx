import Link from "next/link";
import Image from "next/image";
export default function Logo({
  src,
  children,
}: {
  src: string | null;
  children?: React.ReactNode;
}) {
  return (
    <Link title="Ana Sayfa" href="/" className="" passHref>
      {src && (
        <Image
          src={src}
          width={205}
          height={50}
          alt="FINDIK TV"
          priority={true}
        />
      )}
      {src && <div className="ml-2">{children}</div>}
    </Link>
  );
}
