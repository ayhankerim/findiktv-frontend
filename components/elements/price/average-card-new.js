import { useState } from "react"
import dynamic from "next/dynamic"

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

const Loader = ({ cssClass }) => (
  <div className={`lds-ellipsis ${cssClass}`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)

const Advertisement = dynamic(
  () => import("@/components/elements/advertisement"),
  {
    loading: () => <Loader cssClass="h-[300px] lg:h-[120px]" />,
    ssr: false,
  }
)

function currencyFormatter(value) {
  if (!Number(value)) return ""

  const amount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value)
  return amount
}
const CardItem = ({ quality, value1, value2 }) => {
  return (
    <>
      <div
        className={classNames(
          value1 > value2 && "bg-up/80",
          value1 < value2 && "bg-down/80",
          value1 === value2 && "bg-nochange/20",
          "flex justify-center items-center h-12 w-10 rounded p-2"
        )}
      >
        {value1 > value2 && <TbArrowUp className="text-lg text-lightgray" />}
        {value1 < value2 && <TbArrowDown className="text-lg text-lightgray" />}
        {value1 === value2 && <TbMinus className="text-lg text-nochange" />}
      </div>
      <div className="flex flex-col flex-1">
        <span className="font-bold text-xl">{currencyFormatter(value1)}</span>
        <div className="flex justify-between">
          <span className="text-midgray">{quality} Kalite Ort.</span>
          <span
            className={classNames(
              value1 > value2 && "text-up",
              value1 < value2 && "text-down",
              value1 === value2 && "text-nochange",
              ""
            )}
          >
            {value2 > 0 &&
              ((100 * (value1 - value2)) / value2).toFixed(1) + "%"}
          </span>
        </div>
      </div>
    </>
  )
}

const AverageCard = ({ priceCardData }) => {
  const [openInfo, setInfoOpen] = useState("")
  return (
    <>
      <div className="flex flex-col md:flex-row gap-1">
        {priceCardData.map((item, i) => (
          <div
            key={i}
            className="flex relative w-full items-center border border-lightgray rounded gap-2 p-2"
          >
            {openInfo === i ? (
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
                onClick={() => setInfoOpen(i)}
                className="cursor-pointer text-midgray absolute top-[10px] right-[10px]"
              />
            )}
            <CardItem
              quality={item.name}
              value1={item.value1}
              value2={item.value2}
            />
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
