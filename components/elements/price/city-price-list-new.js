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
  const fiskobirlik = {
    title: "Fiskobirlik",
    slug: null,
    data: [
      {
        name: "Sivri",
        date1: "2024-01-09T16:20:57.000Z",
        date2: "2024-01-05T16:20:57.000Z",
        value1: 102,
        value2: 97,
      },
      {
        name: "Levant",
        date1: "2024-01-09T16:20:57.000Z",
        date2: "2024-01-05T16:20:57.000Z",
        value1: 105,
        value2: 98.5,
      },
      {
        name: "Giresun",
        date1: "2024-01-09T16:20:57.000Z",
        date2: "2024-01-05T16:20:57.000Z",
        value1: 108,
        value2: 100,
      },
    ],
  }
  const ferrero = {
    title: "Ferrero",
    slug: null,
    data: [
      {
        name: "Sivri",
        date1: null,
        date2: null,
        value1: null,
        value2: null,
      },
      {
        name: "Levant",
        date1: "2023-12-31T19:20:57.000Z",
        date2: "2023-12-31T16:24:05.000Z",
        value1: 97,
        value2: 95,
      },
      {
        name: "Giresun",
        date1: null,
        date2: null,
        value1: null,
        value2: null,
      },
    ],
  }
  const newPriceData = [...priceData, fiskobirlik, ferrero]
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
                {newPriceData ? (
                  newPriceData.map((item, i) => (
                    <tr
                      key={i}
                      className={classNames(
                        i % 2 ? "" : "bg-lightgray/50",
                        "border-b hover:bg-lightgray"
                      )}
                    >
                      <td className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-left">
                        {item.slug ? (
                          <Link
                            className="underline hover:no-underline"
                            href={
                              "/urunler/" +
                              product +
                              "/" +
                              item.slug +
                              "/fiyati"
                            }
                            title="Detaylar için tıkla"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <span>{item.title}</span>
                        )}
                      </td>
                      {item.data.map((priceType, i) => (
                        <td
                          key={i}
                          className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle"
                        >
                          <Tooltip
                            orientation={i === 2 ? "left" : "top"}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default CityPriceList
