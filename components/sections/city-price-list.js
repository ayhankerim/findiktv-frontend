import React, { useState, useEffect } from "react"
import Link from "next/link"
import useSWR, { SWRConfig } from "swr"
import Tooltip from "@/components/elements/tooltip"
import Moment from "moment"
import "moment/locale/tr"
import { fiskobirlik, ferrero } from "@/utils/price-data"
import { BiLoaderCircle } from "react-icons/bi"

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
const approvalStatus = (status) => {
  switch (status) {
    case "editorOnly":
      return ["adjustment"]
    case "userOnly":
      return ["waiting", "calculation"]
    case "approved":
      return ["approved"]
    case "all":
      return ["adjustment", "waiting", "calculation", "approved"]
    default:
      return ["adjustment"]
  }
}
const fetcher = (...args) => fetch(...args).then((res) => res.json())
const CityPriceList = ({ data }) => {
  const [viewVersion, setViewVersion] = useState([data.version])
  useEffect(() => {
    setViewVersion("average")
  }, [])
  const refreshInterval = 1000 * 60 * 60 * 24
  const priceQualities = ["Sivri", "Levant", "Giresun"]
  let priceData = []
  const qs = require("qs")
  const getValueQuery = (date) => {
    const value = qs.stringify(
      {
        sort: ["city:title:asc"],
        filters: {
          $and: [
            {
              date: {
                $lte: Moment(date).add(1, "days").format("YYYY-MM-DD"),
              },
            },
            {
              date: {
                $gte: Moment(date).format("YYYY-MM-DD"),
              },
            },
          ],
          product: {
            id: {
              $eq: data.product.data.id,
            },
          },
          approvalStatus: {
            $in: approvalStatus(data.approvalStatus),
          },
          type:
            data.priceType === "all"
              ? { $notNull: true }
              : { $eq: [data.priceType] },
        },
        populate: {
          city: {
            fields: ["id", "slug", "title"],
          },
        },
        pagination: {
          page: 1,
          pageSize: 1000,
        },
      },
      {
        encodeValuesOnly: true,
      }
    )
    return value
  }
  const theDateBeforeQuery = qs.stringify(
    {
      sort: ["date:desc"],
      filters: {
        date: {
          $lte: Moment(data.date).startOf("day").format("YYYY-MM-DD"),
        },
      },
      product: {
        id: {
          $eq: data.product.data.id,
        },
      },
      fields: ["date"],
      pagination: {
        page: 1,
        pageSize: 1,
      },
    },
    {
      encodeValuesOnly: true,
    }
  )
  const { data: getPriceValue, error: getPriceValueError } = useSWR(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/prices?` +
      getValueQuery(data.date),
    fetcher,
    { refreshInterval: refreshInterval }
  )
  const { data: theDateBefore, error: theDateBeforeError } = useSWR(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/prices?` +
      theDateBeforeQuery,
    fetcher,
    { refreshInterval: refreshInterval }
  )
  const { data: getPrevPriceValue, error: getPrevPriceValueError } = useSWR(
    theDateBefore
      ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/prices?` +
          getValueQuery(theDateBefore.data[0].attributes.date)
      : null,
    fetcher,
    { refreshInterval: refreshInterval }
  )
  const priceCities = getPriceValue
    ? getPriceValue.data.map((item) => ({
        id: item.attributes.city.data.id,
        attributes: {
          slug: item.attributes.city.data.attributes.slug,
          title: item.attributes.city.data.attributes.title,
        },
      }))
    : []

  const uniqueCityIDs = Array.from(
    new Set(
      getPriceValue
        ? getPriceValue.data.map((item) => item.attributes.city.data.id)
        : []
    )
  )

  if (getPriceValue && getPrevPriceValue)
    for (let y = 0; y < uniqueCityIDs.length; y++) {
      let priceCitiesQualityArray = []
      const priceCityFiltered = priceCities.filter(
        (item) => item.id === uniqueCityIDs[y]
      )
      for (let i = 0; i < priceQualities.length; i++) {
        let priceSum = 0
        let totalvolume = 0
        let highest
        let lowest
        getPriceValue.data
          .filter(
            (item) =>
              priceCityFiltered[0].id === item.attributes.city.data.id &&
              priceQualities[i] === item.attributes.quality
          )
          .map((item, index) => {
            priceSum =
              item.attributes.average * item.attributes.volume + priceSum
            totalvolume = item.attributes.volume + totalvolume
            if (!highest) {
              highest = item.attributes.max
            } else if (item.attributes.max > highest) {
              highest = item.attributes.max
            }
            if (!lowest) {
              lowest = item.attributes.min
            } else if (item.attributes.min < lowest) {
              lowest = item.attributes.min
            }
          })
        const averageSum = priceSum / totalvolume
        let pricePrevSum = 0
        let totalPrevvolume = 0
        let prevHighest = 0
        let prevLowest = 0
        getPrevPriceValue.data
          .filter(
            (item) =>
              priceCityFiltered[0].id === item.attributes.city.data.id &&
              priceQualities[i] === item.attributes.quality
          )
          .map((item) => {
            pricePrevSum =
              item.attributes.average * item.attributes.volume + pricePrevSum
            totalPrevvolume = item.attributes.volume + totalPrevvolume
            if (!prevHighest) {
              prevHighest = item.attributes.max
            } else if (item.attributes.max > highest) {
              prevHighest = item.attributes.max
            }
            if (!prevLowest) {
              prevLowest = item.attributes.min
            } else if (item.attributes.min < lowest) {
              prevLowest = item.attributes.min
            }
          })
        const averagePrevSum = pricePrevSum / totalPrevvolume
        priceCitiesQualityArray.push({
          name: priceQualities[i],
          date1: getPriceValue.data.filter(
            (item) => priceCityFiltered[0].id === item.attributes.city.data.id
          )[0].attributes.date,
          date2: getPrevPriceValue.data.filter(
            (item) => priceCityFiltered[0].id === item.attributes.city.data.id
          )[0]?.attributes.date,
          value1: averageSum,
          value2: averagePrevSum,
          highest1: highest,
          highest2: prevHighest,
          lowest1: lowest,
          lowest2: prevLowest,
        })
      }
      priceData.push({
        title: priceCityFiltered[0].attributes.title,
        slug: priceCityFiltered[0].attributes.slug,
        data: priceCitiesQualityArray,
      })
    }
  if (getPriceValueError)
    return <div>Fiyatlar getirilemedi, lütfen daha sonra tekrar deneyiniz</div>
  if (!getPriceValue)
    return (
      <span role="status">
        <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
        <span className="sr-only">Gönderiliyor...</span>
        <span>Gönderiliyor...</span>
      </span>
    )
  const newPriceData = [...priceData, fiskobirlik, ferrero]
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <div className="flex flex-col">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden border rounded">
              <table className="table-auto min-w-full">
                <thead>
                  {data.title && (
                    <tr className="bg-dark text-white text-left">
                      <th className="py-2 px-4" colSpan={4}>
                        <span className="flex justify-between gap-2">
                          <span>{data.title}</span>
                          <span className="flex gap-2">
                            <button
                              type="button"
                              className={`${
                                viewVersion === "min-max" && "bg-secondary"
                              } rounded px-1`}
                              onClick={() => setViewVersion("min-max")}
                            >
                              Fiyat Aralıkları
                            </button>
                            <button
                              type="button"
                              className={`${
                                viewVersion === "average" && "bg-secondary"
                              } rounded px-1`}
                              onClick={() => setViewVersion("average")}
                            >
                              Ortalama
                            </button>
                          </span>
                        </span>
                      </th>
                    </tr>
                  )}
                  <tr className="bg-white border-b">
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-left"
                    ></th>
                    {priceData[0]?.data.map((item, i) => (
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
                                data.product.data.attributes.slug +
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
                              tooltipText={`${Moment(priceType.date1)
                                .format("DD.MM.YYYY")
                                .toLocaleUpperCase("tr")}
                              Tarihli fiyat`}
                            >
                              {viewVersion === "average" && (
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
                              {viewVersion === "min-max" && (
                                <>
                                  <span
                                    className={classNames(
                                      priceType.lowest1 > priceType.lowest2 &&
                                        "text-up",
                                      priceType.lowest1 < priceType.lowest2 &&
                                        "text-down",
                                      priceType.lowest1 === priceType.lowest2 &&
                                        "text-nochange",
                                      ""
                                    )}
                                  >
                                    {currencyFormatter(priceType.lowest1)}
                                  </span>
                                  -
                                  <span
                                    className={classNames(
                                      priceType.highest1 > priceType.highest2 &&
                                        "text-up",
                                      priceType.highest1 < priceType.highest2 &&
                                        "text-down",
                                      priceType.highest1 ===
                                        priceType.highest2 && "text-nochange",
                                      ""
                                    )}
                                  >
                                    {currencyFormatter(priceType.highest1)}
                                  </span>
                                </>
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
            <div className="my-2">
              {data.description && <p>{data.description}</p>}
            </div>
          </div>
        </div>
      </div>
    </SWRConfig>
  )
}

export default CityPriceList
