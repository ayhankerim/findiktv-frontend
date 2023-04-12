import React, { useEffect, useState } from "react"
import HighchartsReact from "highcharts-react-official"
import Highcharts from "highcharts/highstock"
import HighchartsData from "highcharts/modules/data"
import Advertisement from "@/components/elements/advertisement"

if (typeof Highcharts === "object") {
  HighchartsData(Highcharts)
  Highcharts.setOptions({
    lang: {
      loading: "Yükleniyor...",
      months: [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ],
      weekdays: [
        "Pazar",
        "Pazartesi",
        "Salı",
        "Çarşamba",
        "Perşembe",
        "Cuma",
        "Cumartesi",
      ],
      shortMonths: [
        "Oca",
        "Şub",
        "Mar",
        "Nis",
        "May",
        "Haz",
        "Tem",
        "Ağu",
        "Eyl",
        "Eki",
        "Kas",
        "Ara",
      ],
      exportButtonTitle: "Dışarı Aktar",
      printButtonTitle: "Yazdır",
      rangeSelectorFrom: "Başlangış",
      rangeSelectorTo: "Bitiş",
      rangeSelectorZoom: "Periyot",
      downloadPNG: "PNG Olarak indir",
      downloadJPEG: "JPEG olarak indir",
      downloadPDF: "PDF olarak indir",
      downloadSVG: "SVG olarak indir",
      resetZoom: ["Yakınlaşmayı Sıfırla"],
      resetZoomTitle: ["Yakınlaşmayı Sıfırla"],
      printChart: ["Yazdır"],
    },
    time: {
      timezone: "Europe/Istanbul",
    },
  })
}

const PriceChart = ({ grapghData }) => {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      backgroundColor: "transparent",
      plotBorderColor: "#606063",
      style: {
        fontFamily: "var(--font-dosis)",
        color: "#3C3C3C",
      },
    },
    scrollbar: {
      enabled: false,
    },
    navigator: {
      enabled: false,
    },
    rangeSelector: {
      selected: 0,
      inputEnabled: false,
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: [
      {
        labels: {
          align: "right",
          x: -3,
        },
        title: {
          text: "Fiyat",
        },
        height: "80%",
        lineWidth: 2,
        resize: {
          enabled: true,
        },
      },
      {
        labels: {
          align: "right",
          x: -3,
        },
        title: {
          text: "Hacim",
        },
        top: "85%",
        height: "15%",
        offset: 0,
        lineWidth: 2,
      },
    ],
    tooltip: {
      valueSuffix: " ₺",
      valueDecimals: 2,
    },
    marker: {
      enabled: true,
      radius: 3,
    },
    accessibility: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    colors: ["#00aaff", "#0088cc", "#1da1f2"],
    series: [
      {
        name: "Fiyat",
        data: null,
      },
    ],
  })
  useEffect(() => {
    grapghData &&
      setChartOptions({
        series: [
          {
            name: "Ortalama Fındık Fiyatı",
            marker: {
              fillColor: "transparent",
              lineColor: Highcharts.getOptions().colors[0],
            },
            data: grapghData.map(function (item) {
              return [
                new Date(new Date().setTime(item.date)).setHours(0, 0, 0),
                item.average,
              ]
            }),
          },
          {
            type: "column",
            name: "Hacim",
            color: "rgb(67, 67, 72)",
            tooltip: {
              valueSuffix: " kg",
              valueDecimals: 2,
            },
            data: grapghData.map(function (item) {
              return [
                new Date(new Date().setTime(item.date)).setHours(0, 0, 0),
                item.volume,
              ]
            }),
            yAxis: 1,
          },
        ],
      })
  }, [grapghData])
  return (
    <>
      <div className="border border-lightgray rounded p-3">
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={"stockChart"}
          options={chartOptions}
        />
        <p className="text-midgray">
          * Bu grafikte belirtilen tarihteki Sivri, Levant ve Giresun Kalite
          fındık için girilmiş fiyatların ortalamasını görebilirsiniz.
        </p>
      </div>
      <div className="w-full min-h-[300px]">
        <Advertisement position="price-page-middle-2" />
      </div>
    </>
  )
}

export default PriceChart
