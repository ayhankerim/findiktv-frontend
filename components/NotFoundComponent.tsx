import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function NotFound() {
  return (
    <main className="container flex flex-col justify-between gap-4 pt-2 bg-white">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pt-2">
        <div className="flex flex-col flex-1 w-full gap-3">
          <PageHeader
            heading="ARADIĞINIZ SAYFA BULUNAMADI!"
            text="Ulaşmaya çalıştığınız sayfa silinmiş, taşınmış ya da hiç olmamış
            olabilir."
          />
          <div className="flex flex-col justify-center items-center gap-4 py-4 mb-12">
            <div className="flex flex-row items-center justify-center text-center">
              <Link
                href={`/`}
                className="py-2 px-4 ml-4 rounded border text-secondary hover:text-white border-secondary hover:bg-secondary"
              >
                ANA SAYFA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
