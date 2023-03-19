import React, { useMemo } from "react"
import Link from "next/link"
import Moment from "moment"
import "moment/locale/tr"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}
const priceTypes = [
  { name: "Sivri", code: "sivri_avg" },
  { name: "Levant", code: "levant_avg" },
  { name: "Giresun", code: "giresun_avg" },
]
function currencyFormatter(value) {
  if (!Number(value)) return ""

  const amount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value)
  return amount
}
const CityPriceList = ({ product, priceData, cityList }) => {
  const lastCityPrice = useMemo(
    () => (type, priceData, priceType, item) => {
      let theValue = type === 1 ? "-" : 0
      switch (type) {
        case 1:
          theValue = priceData.data.filter(
            (price) =>
              price.attributes.city.data.attributes.title === item &&
              price.attributes.quality === priceType.name
          )[0] ? (
            currencyFormatter(
              priceData.data.filter(
                (price) =>
                  price.attributes.city.data.attributes.title === item &&
                  price.attributes.quality === priceType.name
              )[0].attributes.average
            )
          ) : (
            <span className="text-midgray">-</span>
          )
          break
        case -1:
          theValue =
            priceData.data.filter(
              (price) =>
                price.attributes.city.data.attributes.title === item &&
                price.attributes.quality === priceType.name
            )[0] &&
            priceData.data.filter(
              (price) =>
                price.attributes.city.data.attributes.title === item &&
                price.attributes.quality === priceType.name
            )[1]
              ? priceData.data.filter(
                  (price) =>
                    price.attributes.city.data.attributes.title === item &&
                    price.attributes.quality === priceType.name
                )[0].attributes.average -
                priceData.data.filter(
                  (price) =>
                    price.attributes.city.data.attributes.title === item &&
                    price.attributes.quality === priceType.name
                )[1].attributes.average
              : 0
          break

        default:
          break
      }

      return theValue
    },
    []
  )
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden border rounded">
            <table className="table-auto min-w-full">
              <thead>
                <tr className="bg-dark text-white text-left">
                  <th className="py-2 px-4" colSpan={5}>
                    Şehirlere göre ortalama fiyat verisi
                  </th>
                </tr>
                <tr className="bg-white border-b">
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-left"
                  ></th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                  >
                    Sivri
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                  >
                    Levant
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                  >
                    Giresun
                  </th>
                </tr>
              </thead>
              <tbody>
                {priceData && priceData.data && cityList ? (
                  cityList
                    .filter((item) => item)
                    .map((item, i) => (
                      <tr
                        key={i}
                        className={classNames(
                          i % 2 ? "" : "bg-lightgray/50",
                          "border-b hover:bg-lightgray"
                        )}
                      >
                        <td className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-left">
                          <Link
                            className="underline hover:no-underline"
                            href={
                              "/urunler/" +
                              product +
                              "/" +
                              priceData.data.filter(
                                (price) =>
                                  price.attributes.city.data.attributes
                                    .title === item
                              )[0].attributes.city.data.attributes.slug +
                              "/fiyati"
                            }
                          >
                            {
                              priceData.data.filter(
                                (price) =>
                                  price.attributes.city.data.attributes
                                    .title === item
                              )[0].attributes.city.data.attributes.title
                            }
                          </Link>
                        </td>
                        {priceTypes.map((priceType, i) => (
                          <td
                            key={i}
                            className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle"
                          >
                            <span
                              className={classNames(
                                lastCityPrice(-1, priceData, priceType, item) >
                                  0
                                  ? "text-up"
                                  : lastCityPrice(
                                      1,
                                      priceData,
                                      priceType,
                                      item
                                    ) < 0
                                  ? "test-down"
                                  : "text-nochange",
                                "text-sm"
                              )}
                            >
                              {lastCityPrice(1, priceData, priceType, item)}
                            </span>
                          </td>
                        ))}
                        <td className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle">
                          {Moment(
                            priceData.data.filter(
                              (price) =>
                                ["Sivri", "Levant", "Giresun"].includes(
                                  price.attributes.quality
                                ) &&
                                price.attributes.city.data.attributes.title ===
                                  item
                            )[0].attributes.date
                          ).fromNow(true)}{" "}
                          önce
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-4">
                      Fiyatlar getiriliyor, lütfen bekleyiniz!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className="text-sm text-midgray py-4 pl-4">
              İlgili şehirdeki son ortalama fiyat verisidir. Detay için şehir
              adına tıklayınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CityPriceList
