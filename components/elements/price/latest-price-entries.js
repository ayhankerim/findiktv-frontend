import Moment from "moment"
import "moment/locale/tr"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

function volumeFormatter(value) {
  if (!Number(value)) return ""

  const amount = new Intl.NumberFormat("tr-TR").format(value)
  return amount
}

function currencyFormatter(value) {
  if (!Number(value)) return ""

  const amount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value)
  return amount
}

const LatestPriceEntries = ({ lastEntries }) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden border rounded">
            <table className="table-auto min-w-full">
              <thead>
                <tr className="bg-dark text-white text-left">
                  <th className="py-2 px-4" colSpan={6}>
                    Son 10 fiyat verisi
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
                    En düşük
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                  >
                    En yüksek
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                  >
                    Ortalama
                  </th>
                  <th
                    scope="col"
                    className="hidden md:table-cell text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                  >
                    Miktar
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                  ></th>
                </tr>
              </thead>
              <tbody>
                {lastEntries ? (
                  lastEntries.map((item, i) => (
                    <tr
                      key={i}
                      className={classNames(
                        i % 2 ? "" : "bg-lightgray/50",
                        "border-b hover:bg-lightgray"
                      )}
                    >
                      <td className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-left align-middle">
                        {item.attributes.quality}
                      </td>
                      <td className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle">
                        {currencyFormatter(item.attributes.min)}
                      </td>
                      <td className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle">
                        {currencyFormatter(item.attributes.max)}
                      </td>
                      <td className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle">
                        {currencyFormatter(item.attributes.average)}
                      </td>
                      <td className="hidden md:table-cell text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle">
                        {item.attributes.volume > 100
                          ? volumeFormatter(item.attributes.volume) + " kg"
                          : "-"}
                      </td>
                      <td className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle">
                        {Moment(item.attributes.date).fromNow(true)} önce
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr
                    className={classNames(
                      "bg-lightgray/50",
                      "border-b hover:bg-lightgray"
                    )}
                  >
                    <td
                      colSpan={6}
                      className="text-sm text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right align-middle"
                    >
                      getiriliyor
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LatestPriceEntries
