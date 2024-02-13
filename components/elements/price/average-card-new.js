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
const getBgColor = (value1, value2) => {
  if (value1 > value2) return "bg-up/80"
  else if (value1 < value2) return "bg-down/80"
  else return "bg-nochange/20"
}

const getIcon = (value1, value2) => {
  if (!value1 || !value2) return <TbMinus className="text-lg text-nochange" />
  if (value1 > value2) return <TbArrowUp className="text-lg text-lightgray" />
  if (value1 < value2) return <TbArrowDown className="text-lg text-lightgray" />
  return <TbMinus className="text-lg text-nochange" />
}
const CardItem = ({ quality, value1, value2 }) => {
  return (
    <>
      <div
        className={classNames(
          getBgColor(value1, value2),
          "flex justify-center items-center h-12 w-10 rounded p-2"
        )}
      >
        {getIcon(value1, value2)}
      </div>
      <div className="flex flex-col flex-1">
        <div className="font-bold text-xl">{currencyFormatter(value1)}</div>
        <div className="flex justify-between">
          <h2 className="text-midgray">{quality} Kalite Ort.</h2>
          <div
            className={classNames(
              value1 > value2 && "text-up",
              value1 < value2 && "text-down",
              value1 === value2 && "text-nochange",
              ""
            )}
          >
            {value2 > 0 &&
              ((100 * (value1 - value2)) / value2).toFixed(1) + "%"}
          </div>
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
