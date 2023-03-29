import React, { useEffect, useState } from "react"
import { fetchAPI } from "@/utils/api"
import Advertisement from "@/components/elements/advertisement"
import Moment from "moment"
import "moment/locale/tr"

import {
  TbArrowDown,
  TbArrowUp,
  TbMinus,
  TbInfoCircle,
  TbX,
  TbLoader,
} from "react-icons/tb"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Loader = () => (
  <div className="lds-ellipsis">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)
const priceQualities = [
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
const CardItem = ({ product, type, quality }) => {
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState(0)
  const [prevPrice, setPrevPrice] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetchAPI("/prices", {
      filters: {
        product: {
          id: {
            $eq: product, // Değiştir product olacak
          },
        },
        approvalStatus: {
          $eq: "approved",
        },
        type: {
          $eq: type, //değişken olacak
        },
        quality: {
          $eq: quality, //değişken olacak
        },
      },
      fields: ["date"],
      sort: ["date:desc"],
      pagination: {
        start: 0,
        limit: 1,
      },
    }).then(async (inDate) => {
      await fetchAPI("/prices", {
        filters: {
          product: {
            id: {
              $eq: product,
            },
          },
          date: {
            $lt: Moment(inDate.data[0].attributes.date)
              .utcOffset(3)
              .set("hour", 0)
              .set("minute", 0)
              .set("second", 0)
              .format("YYYY-MM-DD HH:mm:ss"),
          },
          approvalStatus: {
            $eq: "approved",
          },
          type: {
            $eq: type,
          },
          quality: {
            $eq: quality,
          },
        },
        fields: ["date"],
        sort: ["date:desc"],
        pagination: {
          start: 0,
          limit: 1,
        },
      }).then(async (prevDate) => {
        await fetchAPI("/prices", {
          filters: {
            date: {
              $eq: prevDate.data[0].attributes.date,
            },
            product: {
              id: {
                $eq: product,
              },
            },
            approvalStatus: {
              $eq: "approved",
            },
            type: {
              $eq: type,
            },
            quality: {
              $eq: quality,
            },
          },
          fields: ["average", "volume"],
          pagination: {
            start: 0,
            limit: 100,
          },
        }).then((prevData) => {
          let priceSum = 0
          let totalvolume = 0
          prevData.data.map((item) => {
            priceSum =
              item.attributes.average * item.attributes.volume + priceSum
            totalvolume = item.attributes.volume + totalvolume
          })
          const averageSum = priceSum / totalvolume
          setPrevPrice(averageSum)
        })
      })
      await fetchAPI("/prices", {
        filters: {
          date: {
            $eq: inDate.data[0].attributes.date,
          },
          product: {
            id: {
              $eq: 1, // Değiştir product olacak
            },
          },
          approvalStatus: {
            $eq: "approved",
          },
          type: {
            $eq: type, //değişken olacak
          },
          quality: {
            $eq: quality, //değişken olacak
          },
        },
        fields: ["average", "volume"],
        pagination: {
          start: 0,
          limit: 100,
        },
      }).then((inData) => {
        setLoading(false)
        let priceSum = 0
        let totalvolume = 0
        inData.data.map((item) => {
          priceSum = item.attributes.average * item.attributes.volume + priceSum
          totalvolume = item.attributes.volume + totalvolume
        })
        const averageSum = priceSum / totalvolume
        setPrice(averageSum)
      })
    })
  }, [product, quality, type])

  return (
    <>
      {!loading ? (
        <>
          <div
            className={classNames(
              price > prevPrice && "bg-up/80",
              price < prevPrice && "bg-down/80",
              price === prevPrice && "bg-nochange/20",
              "flex justify-center items-center h-12 w-10 rounded p-2"
            )}
          >
            {price > prevPrice && (
              <TbArrowUp className="text-lg text-lightgray" />
            )}
            {price < prevPrice && (
              <TbArrowDown className="text-lg text-lightgray" />
            )}
            {price === prevPrice && (
              <TbMinus className="text-lg text-nochange" />
            )}
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-bold text-xl">
              {currencyFormatter(price)}
            </span>
            <div className="flex justify-between">
              <span className="text-midgray">{quality} Kalite Ort.</span>
              <span
                className={classNames(
                  price > prevPrice && "text-up",
                  price < prevPrice && "text-down",
                  price === prevPrice && "text-nochange",
                  ""
                )}
              >
                {prevPrice > 0 &&
                  ((100 * (price - prevPrice)) / prevPrice).toFixed(1) + "%"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center items-center h-12 w-10 bg-midgray/20 rounded p-2">
            <TbLoader className="animate-spin text-lg text-midgray" />
          </div>
          <div className="flex flex-col flex-1">
            <Loader />
            <div className="flex justify-between">
              <span className="text-midgray">{type} Kalite</span>
              <span className="text-midgray">...</span>
            </div>
          </div>
        </>
      )}
    </>
  )
}

const AverageCard = ({ product, type }) => {
  const [openInfo, setInfoOpen] = useState("")

  useEffect(() => {}, [])
  return (
    <>
      <div className="flex flex-col md:flex-row gap-1">
        {priceQualities.map((item, i) => (
          <div
            key={i}
            className="flex relative w-full items-center border border-lightgray rounded gap-2 p-2"
          >
            {openInfo === item.code ? (
              <>
                <TbX
                  onClick={() => setInfoOpen("")}
                  className="cursor-pointer text-midgray absolute z-20 top-[10px] right-[10px]"
                />
                <div className="absolute z-10 bg-white/90 my-3 pr-6">
                  Buradaki fiyat <strong>{item.name} kalite fındık</strong> için
                  bütün şehirlerdeki son fiyat verisinin ortalamasını ifade
                  eder.
                </div>
              </>
            ) : (
              <TbInfoCircle
                onClick={() => setInfoOpen(item.code)}
                className="cursor-pointer text-midgray absolute top-[10px] right-[10px]"
              />
            )}
            <CardItem product={product} type={type} quality={item.name} />
          </div>
        ))}
      </div>
      <div className="w-full h-[300px] lg:h-[120px] -mx-2 sm:mx-0">
        <Advertisement position="header-top-desktop" adformat="horizontal" />
      </div>
    </>
  )
}

export default AverageCard
