import React, { useState, useMemo } from "react"
import Advertisement from "@/components/elements/advertisement"

import {
  TbArrowDown,
  TbArrowUp,
  TbMinus,
  TbInfoCircle,
  TbX,
  TbLoader,
} from "react-icons/tb"

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

const AverageCard = ({ cardData }) => {
  const [openInfo, setInfoOpen] = useState("")

  const priceAverage = useMemo(
    () => (params) => {
      const newestDay = new Date(
        cardData.data.filter(
          (item) => item.attributes.quality === params
        )[0]?.attributes.date
      ).toLocaleDateString()

      let priceSum = 0
      let totalvolume = 0
      cardData.data
        .filter(
          (item) =>
            new Date(item.attributes.date).toLocaleDateString() === newestDay &&
            item.attributes.quality === params
        )
        .map((item) => {
          priceSum = item.attributes.average * item.attributes.volume + priceSum
          totalvolume = item.attributes.volume + totalvolume
        })
      const averageSum = priceSum / totalvolume
      return averageSum
    },
    [cardData]
  )

  const priceChange = useMemo(
    () => (params) => {
      const newestDay = new Date(
        cardData.data.filter(
          (item) => item.attributes.quality === params
        )[0]?.attributes.date
      ).toLocaleDateString()
      const secondDay = new Date(
        cardData.data.filter(
          (item) =>
            new Date(item.attributes.date).toLocaleDateString() < newestDay &&
            item.attributes.quality === params
        )[0]?.attributes.date
      ).toLocaleDateString()

      let priceSum = 0
      let totalvolume = 0
      let secondpriceSum = 0
      let secondtotalvolume = 0

      cardData.data
        .filter(
          (item) =>
            new Date(item.attributes.date).toLocaleDateString() === newestDay &&
            item.attributes.quality === params
        )
        .map((item) => {
          priceSum = item.attributes.average * item.attributes.volume + priceSum
          totalvolume = item.attributes.volume + totalvolume
        })

      cardData.data
        .filter(
          (item) =>
            new Date(item.attributes.date).toLocaleDateString() === secondDay &&
            item.attributes.quality === params
        )
        .map((item) => {
          secondpriceSum =
            item.attributes.average * item.attributes.volume + secondpriceSum
          secondtotalvolume = item.attributes.volume + secondtotalvolume
        })

      const averageSum = priceSum / totalvolume
      const secondaverageSum = secondpriceSum / secondtotalvolume

      return (100 * (averageSum - secondaverageSum)) / secondaverageSum
    },
    [cardData]
  )
  return (
    <>
      <div className="flex flex-col md:flex-row gap-3">
        {priceTypes.map((item, i) => (
          <div
            key={i}
            className="flex relative w-full items-center border border-lightgray rounded gap-3 p-3"
          >
            {cardData ? (
              <>
                {openInfo === item.code ? (
                  <>
                    <TbX
                      onClick={() => setInfoOpen("")}
                      className="cursor-pointer text-midgray absolute z-20 top-[10px] right-[10px]"
                    />
                    <div className="absolute z-10 bg-white/90 my-3 pr-6">
                      Buradaki fiyat <strong>{item.name} kalite fındık</strong>{" "}
                      için bütün şehirlerdeki son fiyat verisinin ortalamasını
                      ifade eder.
                    </div>
                  </>
                ) : (
                  <TbInfoCircle
                    onClick={() => setInfoOpen(item.code)}
                    className="cursor-pointer text-midgray absolute top-[10px] right-[10px]"
                  />
                )}
                {(() => {
                  let changeRate = priceChange(item.name).toFixed(1)
                  switch (true) {
                    case changeRate > 0:
                      return (
                        <>
                          <div className="flex justify-center items-center h-12 w-10 bg-up/80 rounded p-2">
                            <TbArrowUp className="text-lg text-lightgray" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="font-bold text-xl">
                              {currencyFormatter(priceAverage(item.name))}
                            </span>
                            <div className="flex justify-between">
                              <span className="text-midgray">
                                {item.name} Kalite Ort. Fiyat
                              </span>
                              <span className="text-up">{changeRate}%</span>
                            </div>
                          </div>
                        </>
                      )
                    case changeRate < 0:
                      return (
                        <>
                          <div className="flex justify-center items-center h-12 w-10 bg-down/80 rounded p-2">
                            <TbArrowDown className="text-lg text-lightgray" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="font-bold text-xl">
                              {currencyFormatter(priceAverage(item.name))}
                            </span>
                            <div className="flex justify-between">
                              <span className="text-midgray">
                                {item.name} Kalite Ort. Fiyat
                              </span>
                              <span className="text-down">{changeRate}%</span>
                            </div>
                          </div>
                        </>
                      )
                    default:
                      return (
                        <>
                          <div className="flex justify-center items-center h-12 w-10 bg-nochange/20 rounded p-2">
                            <TbMinus className="text-lg text-nochange" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="font-bold text-xl">
                              {currencyFormatter(priceAverage(item.name))}
                            </span>
                            <div className="flex justify-between">
                              <span className="text-midgray">
                                {item.name} Kalite Ort. Fiyat
                              </span>
                              <span className="text-nochange">0.00%</span>
                            </div>
                          </div>
                        </>
                      )
                  }
                })()}
              </>
            ) : (
              <>
                <div className="flex justify-center items-center h-12 w-10 bg-midgray/20 rounded p-2">
                  <TbLoader className="animate-spin text-lg text-midgray" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="loader-dots block relative w-20 h-[48px]">
                    <div className="absolute top-0 mt-3 w-3 h-3 rounded-full bg-lightgray"></div>
                    <div className="absolute top-0 mt-3 w-3 h-3 rounded-full bg-lightgray"></div>
                    <div className="absolute top-0 mt-3 w-3 h-3 rounded-full bg-lightgray"></div>
                    <div className="absolute top-0 mt-3 w-3 h-3 rounded-full bg-lightgray"></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-midgray">{item.name} Kalite</span>
                    <span className="text-midgray">...</span>
                  </div>
                </div>
              </>
            )}
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
