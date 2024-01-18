import React, { useState } from "react"
import Link from "next/link"
import useSWR, { SWRConfig } from "swr"
import Tooltip from "@/components/elements/tooltip"
import Moment from "moment"
import "moment/locale/tr"
import { fiskobirlik, ferrero } from "@/utils/price-data"
import { BiLoaderCircle } from "react-icons/bi"
import { BsChevronDown, BsChevronUp } from "react-icons/bs"
import { MdTrendingFlat, MdTrendingUp, MdTrendingDown } from "react-icons/md"

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
const PriceColor = (current, old) => {
  if (!Number(current) || !Number(old)) return "text-nochange"
  if (current > old) {
    return "text-up"
  } else if (current < old) {
    return "text-down"
  } else {
    return "text-nochange"
  }
}
const PriceIcon = (current, old) => {
  if (!Number(current) || !Number(old)) return ""
  if (current > old) {
    return <MdTrendingUp className="text-lg inline-block" />
  } else if (current < old) {
    return <MdTrendingDown className="text-lg inline-block" />
  } else {
    return <MdTrendingFlat className="text-lg inline-block" />
  }
}
const ChangeCalculator = (current, old) => {
  if (!Number(current) || !Number(old)) return ""
  const result = ((current - old) / old) * 100
  if (result > 0) {
    return "%" + result.toFixed(1)
  } else if (result < 0) {
    return "-%" + result.toFixed(1) * -1
  } else {
    return "%0"
  }
}
const PriceTableRow = ({ index, item, productSlug }) => {
  const [status, setStatus] = useState(false)
  const handleToggle = () => {
    setStatus(!status)
  }
  return (
    <>
      <div
        className={classNames(
          status ? "bg-lightgray/50" : "",
          "flex justify-between items-center group border-b"
        )}
      >
        <div className="flex-none text-base sm:text-lg font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-left">
          {item.slug ? (
            <Link
              className="underline hover:no-underline"
              href={"/urunler/" + productSlug + "/" + item.slug + "/fiyati"}
              title="Detaylar için tıkla"
            >
              {item.title}
            </Link>
          ) : (
            <span>{item.title}</span>
          )}
        </div>
        <div
          className="flex grow text-base sm:text-lg font-medium text-gray-900 text-right cursor-pointer"
          onClick={handleToggle}
        >
          <Tooltip
            orientation="top"
            tooltipText={`${Moment(item.data[0].date1)
              .format("DD.MM.YYYY")
              .toLocaleUpperCase("tr")}
                                Tarihli fiyat`}
          >
            {item.slug ? (
              <div
                className={`flex justify-end items-center ${PriceColor(
                  item.data[0].value1 +
                    item.data[1].value1 +
                    item.data[2].value1,
                  item.data[0].value2 +
                    item.data[1].value2 +
                    item.data[2].value2
                )} px-4 gap-2`}
              >
                <span>{currencyFormatter(item.data[0].lowest1)}</span>
                <span>-</span>
                <span>{currencyFormatter(item.data[2].highest1)}</span>
                {PriceIcon(
                  item.data[0].value1 +
                    item.data[1].value1 +
                    item.data[2].value1,
                  item.data[0].value2 +
                    item.data[1].value2 +
                    item.data[2].value2
                )}
              </div>
            ) : (
              <div className={`flex justify-end items-center px-4 gap-2`}>
                <span>{currencyFormatter(item.data[0].value1)}</span>
                <span>-</span>
                <span>{currencyFormatter(item.data[2].value1)}</span>
              </div>
            )}
          </Tooltip>
          <div className="flex-none border-l">
            <button className="p-3">
              {status ? <BsChevronUp /> : <BsChevronDown />}
            </button>
          </div>
        </div>
      </div>
      {status && (
        <div className="flex flex-col xl:flex-row bg-lightgray/50 border-b p-2 gap-2">
          {item.slug && (
            <div className="hidden xl:flex flex-col p-2">
              <h3 className="text-base font-bold opacity-0">Fiyatlar</h3>
              <div className="flex flex-col">
                <div
                  className={`flex justify-end leading-[40px] gap-2 whitespace-nowrap`}
                >
                  En yüksek
                </div>
              </div>
              <hr />
              <div className="flex flex-col">
                <div
                  className={`flex justify-end leading-[40px] gap-2 whitespace-nowrap`}
                >
                  Ortalama
                </div>
              </div>
              <hr />
              <div className="flex flex-col">
                <div
                  className={`flex justify-end leading-[40px] gap-2 whitespace-nowrap`}
                >
                  En düşük
                </div>
              </div>
            </div>
          )}
          {item.data.map((price, i) => {
            return (
              <div
                className="flex flex-col w-full bg-white border border-lightgray rounded p-2"
                key={i}
              >
                <h3 className="text-base font-bold text-center">
                  {price.name} kalite
                </h3>
                <div className="flex flex-col">
                  <div
                    className={`flex justify-center items-center ${PriceColor(
                      price.highest1,
                      price.highest2
                    )} px-2 gap-2`}
                  >
                    {item.slug && <span className="xl:hidden">En yüksek</span>}
                    <span>
                      {ChangeCalculator(price.highest1, price.highest2)}
                    </span>
                    <span className="text-lg">
                      {currencyFormatter(price.highest1)}
                    </span>
                    {PriceIcon(price.highest1, price.highest2)}
                  </div>
                </div>
                <hr />
                <div className="flex flex-col">
                  <div
                    className={`flex justify-center items-center ${PriceColor(
                      price.value1,
                      price.value2
                    )} px-2 gap-2`}
                  >
                    {item.slug && <span className="xl:hidden">Ortalama</span>}
                    <span>{ChangeCalculator(price.value1, price.value2)}</span>
                    <span className="text-lg">
                      {currencyFormatter(price.value1)}
                    </span>
                    {PriceIcon(price.value1, price.value2)}
                  </div>
                </div>
                <hr />
                <div className="flex flex-col">
                  <div
                    className={`flex justify-center items-center ${PriceColor(
                      price.lowest1,
                      price.lowest2
                    )} px-2 gap-2`}
                  >
                    {item.slug && <span className="xl:hidden">En düşük</span>}
                    <span>
                      {ChangeCalculator(price.lowest1, price.lowest2)}
                    </span>
                    <span className="text-lg">
                      {currencyFormatter(price.lowest1)}
                    </span>
                    {PriceIcon(price.lowest1, price.lowest2)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
const fetcher = (...args) => fetch(...args).then((res) => res.json())
const CityPriceList = ({ data }) => {
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
        <div className="overflow-hidden border rounded">
          <div className="flex flex-col">
            {data.title && (
              <div className="bg-dark text-white text-left py-2 px-4">
                {data.title}
              </div>
            )}
            <div className="flex flex-col">
              {newPriceData ? (
                newPriceData.map((item, i) => (
                  <PriceTableRow
                    key={i}
                    index={i}
                    item={item}
                    productSlug={data.product.data.attributes.slug}
                  />
                ))
              ) : (
                <div className="text-center p-4">
                  Fiyatlar getiriliyor, lütfen bekleyiniz!
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="my-2">
          {data.description && <p>{data.description}</p>}
        </div>
      </div>
    </SWRConfig>
  )
}

export default CityPriceList
