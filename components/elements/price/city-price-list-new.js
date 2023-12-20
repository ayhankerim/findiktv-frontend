import React from "react"
import Link from "next/link"
import Tooltip from "@/components/elements/tooltip"
import Moment from "moment"
import "moment/locale/tr"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}
function currencyFormatter(value) {
  if (!Number(value)) return ""

  const amount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value)
  return amount
}
const CityPriceList = ({ product, priceData, defaultPriceData }) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden border rounded">
            <table className="table-auto min-w-full">
              <thead>
                <tr className="bg-dark text-white text-left">
                  <th className="py-2 px-4" colSpan={4}>
                    Şehirlere göre ortalama fiyat verisi
                  </th>
                </tr>
                <tr className="bg-white border-b">
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-left"
                  ></th>
                  {priceData[0].data.map((item, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                    >
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {priceData ? (
                  priceData.map((item, i) => (
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
                            "/urunler/" + product + "/" + item.slug + "/fiyati"
                          }
                        >
                          {item.title}
                        </Link>
                      </td>
                      {item.data.map((priceType, i) => (
                        <td
                          key={i}
                          className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle"
                        >
                          <Tooltip
                            orientation={i === 2 ? "left" : "bottom"}
                            version="clean"
                            tooltipText={`${(Moment(priceType.date1) >
                            Moment().subtract(15, "days")
                              ? Moment(priceType.date1)
                              : Moment().subtract(15, "days")
                            )
                              .fromNow(true)
                              .toLocaleUpperCase("tr")}
                            ÖNCE`}
                          >
                            {Moment(priceType.date1) <
                            Moment().subtract(15, "days") ? (
                              <span className="text-nochange">
                                {currencyFormatter(defaultPriceData[i].average)}
                              </span>
                            ) : (
                              <span
                                className={classNames(
                                  priceType.value1 > priceType.value2 &&
                                    "text-up",
                                  priceType.value1 < priceType.value2 &&
                                    "text-down",
                                  priceType.value1 === priceType.value2 &&
                                    "text-nochange",
                                  ""
                                )}
                              >
                                {currencyFormatter(priceType.value1)}
                              </span>
                            )}
                          </Tooltip>
                        </td>
                      ))}
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
