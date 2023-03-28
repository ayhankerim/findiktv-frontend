import React, { useEffect, useState, useMemo } from "react"
import HighchartsReact from "highcharts-react-official"
import Highcharts from "highcharts/highstock"
//import HighchartsMore from "highcharts/highcharts-more"
//import HighchartsExporting from "highcharts/modules/exporting"
//import HighchartsExportData from "highcharts/modules/export-data"
//import HighchartsAccessibility from "highcharts/modules/accessibility"
import HighchartsData from "highcharts/modules/data"
import Advertisement from "@/components/elements/advertisement"

if (typeof Highcharts === "object") {
  //HighchartsExporting(Highcharts)
  //HighchartsExportData(Highcharts)
  //HighchartsAccessibility(Highcharts)
  HighchartsData(Highcharts)
  //HighchartsMore(Highcharts)
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
  const average = useMemo(
    () => (arr) => {
      let sums = {},
        counts = {},
        volume = {},
        quality = {},
        results = [],
        date
      for (var i = 0; i < arr.length; i++) {
        date =
          new Date(arr[i].attributes.date).setHours(0, 0, 0) +
          24 * 60 * 60 * 1000
        if (!(date in sums)) {
          sums[date] = 0
          counts[date] = 0
          volume[date] = 0
          quality[date] = ""
        }
        sums[date] += arr[i].attributes.average * arr[i].attributes.volume
        volume[date] += arr[i].attributes.volume
        quality[date] = arr[i].attributes.quality
        counts[date]++
      }

      for (date in sums) {
        results.push({
          date: date,
          average: sums[date] / volume[date],
          volume: volume[date],
          quality: quality[date],
        })
      }
      return results
    },
    []
  )
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
      grapghData.data &&
      setChartOptions({
        series: [
          {
            name: "Sivri Kalite",
            marker: {
              fillColor: "transparent",
              lineColor: Highcharts.getOptions().colors[0],
            },
            data: average(grapghData.data)
              .filter((item) => item.quality === "Sivri")
              .map(function (item) {
                return [
                  new Date(new Date().setTime(item.date)).setHours(0, 0, 0),
                  item.average,
                ]
              }),
          },
          {
            name: "Levant Kalite",
            marker: {
              fillColor: "transparent",
              lineColor: Highcharts.getOptions().colors[1],
            },
            data: average(grapghData.data)
              .filter((item) => item.quality === "Levant")
              .map(function (item) {
                return [
                  new Date(new Date().setTime(item.date)).setHours(0, 0, 0),
                  item.average,
                ]
              }),
          },
          {
            name: "Giresun Kalite",
            marker: {
              fillColor: "transparent",
              lineColor: Highcharts.getOptions().colors[2],
            },
            data: average(grapghData.data)
              .filter((item) => item.quality === "Giresun")
              .map(function (item) {
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
            data: average(grapghData.data).map(function (item) {
              return [
                new Date(new Date().setTime(item.date)).setHours(0, 0, 0),
                item.volume,
              ]
            }),
            yAxis: 1,
          },
        ],
      })
  }, [average, city, grapghData, product, type])
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
