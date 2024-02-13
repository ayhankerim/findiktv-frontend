import Advertisement from "@/components/elements/advertisement"
import Link from "next/link"
const FirmViewSidebar = ({ sectorList }) => {
  return (
    <>
      <Advertisement position="sidebar-top-desktop" />
      <div className="flex flex-row items-center justify-between border-b relative">
        <h2 className="font-semibold text-base text-midgray">Sektörler</h2>
        <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px]"></span>
      </div>
      <div className="mt-5 md:col-span-2 md:mt-0 mb-8">
        <ul className="flex flex-col divide-y">
          {sectorList
            .slice()
            .sort(
              (a, b) =>
                b.attributes.firms.data.length - a.attributes.firms.data.length
            )
            .map((item, i) => (
              <li key={item.id}>
                <Link
                  href={`/firma/sektor/${item.attributes.slug}`}
                  className="flex justify-between p-2 hover:bg-lightgray"
                >
                  <span>{item.attributes.name}</span>
                  <strong>{item.attributes.firms.data.length}</strong>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </>
  )
}
export default FirmViewSidebar
