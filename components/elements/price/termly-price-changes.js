import React, { useMemo } from "react"
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

const priceTerms = [
  [
    { name: "Güncel Değer", day: 0, type: 0 },
    { name: "Bir Önceki Değer", day: 1, type: 0 },
    { name: "Değişim", day: 0, type: 4 },
    { name: "Değişim (%)", day: 0, type: 1 },
  ],
  [
    { name: "Haftalık Değişim", day: 7, type: 4 },
    { name: "Haftalık Değişim (%)", day: 7, type: 1 },
    { name: "Haftalık En Düşük", day: 7, type: 2 },
    { name: "Haftalık En Yüksek", day: 7, type: 3 },
  ],
  [
    { name: "Aylık Değişim", day: 30, type: 4 },
    { name: "Aylık Değişim (%)", day: 30, type: 1 },
    { name: "Aylık En Düşük", day: 30, type: 2 },
    { name: "Aylık En Yüksek", day: 30, type: 3 },
  ],
  [
    { name: "Yıllık Değişim", day: 360, type: 4 },
    { name: "Yıllık Değişim (%)", day: 360, type: 1 },
    { name: "Yıllık En Düşük", day: 360, type: 2 },
    { name: "Yıllık En Yüksek", day: 360, type: 3 },
  ],
]

function currencyFormatter(value) {
  if (!Number(value)) return ""

  const amount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value)
  return amount
}
const CalculateAverage = (priceData, selectedDay, name) => {
  let priceSum = 0
  let totalvolume = 0
  priceData.data
    .filter(
      (item) =>
        new Date(item.attributes.date).toLocaleDateString() === selectedDay &&
        item.attributes.quality === name
    )
    .map((item) => {
      priceSum = item.attributes.average * item.attributes.volume + priceSum
      totalvolume = item.attributes.volume + totalvolume
    })
  const averageSum = priceSum / totalvolume
  return averageSum
}

const TermlyPriceChange = ({ priceData }) => {
  const highLowPrice = (priceData, selectedDay, name, day, type) => {
    switch (type) {
      case 0:
        return priceData.data
          .filter(
            (item) =>
              item.attributes.quality === name &&
              Moment(item.attributes.date).isAfter(
                Moment(selectedDay).subtract(day, "days")
              )
          )
          .sort((a, b) => (a.attributes.min > b.attributes.min ? 1 : -1))[0]
          ?.attributes.max
        break
      case 1:
        return priceData.data
          .filter(
            (item) =>
              item.attributes.quality === name &&
              Moment(item.attributes.date).isAfter(
                Moment(selectedDay).subtract(day, "days")
              )
          )
          .sort((a, b) => (a.attributes.max > b.attributes.max ? -1 : 1))[0]
          ?.attributes.max
        break
      default:
        break
    }
  }
  const priceAverage = (name, day, type) => {
    const newestDay = Moment(
      priceData.data.filter((item) => item.attributes.quality === name)[0]
        ?.attributes.date
    ).format("YYYY-MM-DD")

    const selectedDay =
      day > 0
        ? new Date(
            priceData.data.filter(
              (item) =>
                item.attributes.quality === name &&
                Moment(item.attributes.date).isBefore(
                  Moment(newestDay, "YYYY-MM-DD").subtract(day, "days")
                )
            )[0]?.attributes.date || null
          ).toLocaleDateString()
        : new Date(
            priceData.data.filter(
              (item) => item.attributes.quality === name
            )[0]?.attributes.date
          ).toLocaleDateString()

    const comparedDay = new Date(
      priceData.data.filter(
        (item) =>
          item.attributes.quality === name &&
          Moment(item.attributes.date).isBefore(
            Moment(selectedDay, "DD.MM.YYYY").subtract(1, "days")
          )
      )[0]?.attributes.date || null
    ).toLocaleDateString()

    switch (type) {
      case 0:
        return currencyFormatter(CalculateAverage(priceData, selectedDay, name))
        break
      case 1:
        return !Moment(selectedDay).isBefore(
          Moment("01.01.1990", "DD.MM.YYYY")
        ) && !Moment(comparedDay).isBefore(Moment("01.01.1990", "DD.MM.YYYY"))
          ? (
              (100 *
                (CalculateAverage(priceData, selectedDay, name) -
                  CalculateAverage(priceData, comparedDay, name))) /
              CalculateAverage(priceData, comparedDay, name)
            ).toFixed(2) + "%"
          : "-"
        break
      case 2:
        return currencyFormatter(
          highLowPrice(priceData, newestDay, name, day, 0)
        )
        break
      case 3:
        return currencyFormatter(
          highLowPrice(priceData, newestDay, name, day, 1)
        )
        break
      case 4:
        return !Moment(selectedDay).isBefore(
          Moment("01.01.1990", "DD.MM.YYYY")
        ) && !Moment(comparedDay).isBefore(Moment("01.01.1990", "DD.MM.YYYY"))
          ? currencyFormatter(
              CalculateAverage(priceData, selectedDay, name) -
                CalculateAverage(priceData, comparedDay, name)
            )
          : "-"
        break

      default:
        break
    }
  }
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          {priceData &&
            priceData.data &&
            priceTerms.map((table, i) => (
              <div
                key={i}
                className={classNames(
                  i === 0 ? "" : "mt-4",
                  "overflow-hidden border rounded"
                )}
              >
                <table className="table-auto min-w-full">
                  {i === 0 && (
                    <thead>
                      <tr className="bg-dark text-white text-left">
                        <th className="py-2 px-4" colSpan={4}>
                          Dönemsel fiyat değişimleri
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
                  )}
                  <tbody>
                    {table ? (
                      table.map((term, termI) => (
                        <tr
                          key={termI}
                          className={classNames(
                            termI % 2 ? "" : "bg-lightgray/50",
                            "border-b hover:bg-lightgray"
                          )}
                        >
                          <td className="text-sm font-medium text-darkgray px-2 sm:px-4 py-1 sm:py-2 text-left">
                            {term.name}
                          </td>
                          {priceTypes.map((item, i) => (
                            <td
                              key={i}
                              className={classNames(
                                term.type === 1 || term.type === 4
                                  ? Number(
                                      priceAverage(
                                        item.name,
                                        term.day,
                                        term.type
                                      ).replace(/[^0-9.-]+/g, "")
                                    ) > 0
                                    ? "text-up"
                                    : "text-down"
                                  : "text-dark",
                                "text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 text-right"
                              )}
                            >
                              {priceAverage(item.name, term.day, term.type)}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center p-4">
                          Fiyatlar getiriliyor, lütfen bekleyiniz!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default TermlyPriceChange
