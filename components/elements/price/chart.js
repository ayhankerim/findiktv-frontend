import React, { useEffect, useState } from "react"
import HighchartsReact from "highcharts-react-official"
import Highcharts from "highcharts/highstock"
import HighchartsMore from "highcharts/highcharts-more"
//import HighchartsExporting from "highcharts/modules/exporting"
//import HighchartsExportData from "highcharts/modules/export-data"
import HighchartsAccessibility from "highcharts/modules/accessibility"
import HighchartsData from "highcharts/modules/data"
import Advertisement from "@/components/elements/advertisement"
import { any } from "prop-types"

if (typeof Highcharts === "object") {
  //HighchartsExporting(Highcharts)
  //HighchartsExportData(Highcharts)
  HighchartsAccessibility(Highcharts)
  HighchartsData(Highcharts)
  HighchartsMore(Highcharts)
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

const PriceChart = ({ city, product, type, grapghData }) => {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "arearange",
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
      selected: 4,
      buttons: [
        {
          type: "month",
          count: 1,
          text: "1 ay",
          title: "1 ay göster",
        },
        {
          type: "month",
          count: 3,
          text: "3 ay",
          title: "3 ay göster",
        },
        {
          type: "month",
          count: 6,
          text: "6 ay",
          title: "6 ay göster",
        },
        {
          type: "year",
          count: 1,
          text: "1y",
          title: "Bir yıl göster",
        },
        {
          type: "all",
          text: "Tümü",
          title: "Tümünü göster",
        },
      ],
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
      grapghData.data &&
      setChartOptions({
        series: [
          {
            name: "Sivri Kalite",
            marker: {
              fillColor: "transparent",
              lineColor: Highcharts.getOptions().colors[0],
            },
            data: grapghData.data
              .filter((item) => item.attributes.quality === "Sivri")
              .map(function (item) {
                return [
                  new Date(item.attributes.date).getTime({
                    timeZone: "Europe/Istanbul",
                  }) +
                    3 * 60 * 60 * 1000,
                  item.attributes.min,
                  item.attributes.max,
                ]
              }),
          },
          {
            name: "Levant Kalite",
            marker: {
              fillColor: "transparent",
              lineColor: Highcharts.getOptions().colors[1],
            },
            data: grapghData.data
              .filter((item) => item.attributes.quality === "Levant")
              .map(function (item) {
                return [
                  new Date(item.attributes.date).getTime({
                    timeZone: "Europe/Istanbul",
                  }) +
                    3 * 60 * 60 * 1000,
                  item.attributes.min,
                  item.attributes.max,
                ]
              }),
          },
          {
            name: "Giresun Kalite",
            marker: {
              fillColor: "transparent",
              lineColor: Highcharts.getOptions().colors[2],
            },
            data: grapghData.data
              .filter((item) => item.attributes.quality === "Giresun")
              .map(function (item) {
                return [
                  new Date(item.attributes.date).getTime({
                    timeZone: "Europe/Istanbul",
                  }) +
                    3 * 60 * 60 * 1000,
                  item.attributes.min,
                  item.attributes.max,
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
            data: grapghData.data.map(function (item) {
              return [
                new Date(item.attributes.date).getTime({
                  timeZone: "Europe/Istanbul",
                }) +
                  3 * 60 * 60 * 1000,
                item.attributes.volume,
              ]
            }),
            yAxis: 1,
          },
        ],
      })
  }, [city, grapghData, product, type])
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
          fındık için girilmiş maksimum ve minimum fiyatları görebilirsiniz.
        </p>
      </div>
      <div className="w-full min-h-[300px]">
        <Advertisement position="price-page-middle-2" />
      </div>
    </>
  )
}

export default PriceChart
