import Image from "next/image"
import Link from "next/link"
import { PatternFormat } from "react-number-format"
import {
  MdLocationPin,
  MdPhone,
  MdAlternateEmail,
  MdLink,
} from "react-icons/md"
const FirmView = ({ firms }) => {
  return (
    <div className="flex flex-col gap-4">
      {firms.data.map((item, i) => (
        <div
          key={item.id}
          className="flex flex-col lg:flex-row w-full gap-2 p-1 bg-lightgray hover:bg-lightgray/60 shadow"
        >
          <div className="flex-none relative w-[200px] h-[200px] m-auto overflow-hidden bg-white">
            <Image
              src={
                item.attributes.logo.data
                  ? item.attributes.logo.data.attributes.formats.small.url
                  : "https://www.findiktv.com/cdn-cgi/imagedelivery/A_vnS-Tfmrf1TT32XC1EgA/7bbe9bd7-c876-4387-bd6f-a01dcaec5400/format=auto,width=250"
              }
              alt={item.attributes.name}
              className="absolute inset-0 h-full w-full object-contain rounded p-2"
              priority={true}
              fill
            />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-1 flex-col justify-end">
              <h2 className="text-base font-bold text-secondary">
                {item.attributes.name}
              </h2>
              <address className="flex flex-col not-italic gap-2">
                <div className="flex items-center gap-2">
                  <MdLocationPin />
                  <span>
                    {item.attributes?.address &&
                    item.attributes?.address[3]?.address
                      ? item.attributes.address[3].address +
                        " " +
                        item.attributes.address[2].districtName +
                        " " +
                        item.attributes.address[1].provinceName
                      : "Adres girilmemiş"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  <div className="flex items-center gap-2">
                    <MdPhone />
                    {item.attributes.phone ? (
                      <a
                        className="hover:underline"
                        href={`tel:+90${item.attributes.phone}`}
                      >
                        <PatternFormat
                          format="+90 (###) ### ## ##"
                          value={item.attributes.phone}
                          displayType="text"
                        />
                      </a>
                    ) : (
                      <span>Telefon girilmemiş</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MdLink />
                    {item.attributes.website ? (
                      <a
                        className="hover:underline"
                        target="_blank"
                        rel="nofollow"
                        href={item.attributes.website}
                      >
                        <span>{item.attributes.website}</span>
                      </a>
                    ) : (
                      <span>Web adresi girilmemiş</span>
                    )}
                  </div>
                </div>
              </address>
            </div>
            <div className="flex flex-none justify-center lg:justify-end">
              <Link
                href={`/firma/${item.attributes.slug}`}
                className="min-w-[160px] text-center text-white hover:text-secondary border border-secondary rounded bg-secondary hover:bg-transparent px-5 py-2 transition duration-150 ease-out md:ease-in"
              >
                İncele
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
export default FirmView
