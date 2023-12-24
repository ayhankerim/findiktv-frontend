function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

function currencyFormatter(value) {
  if (!Number(value)) return "-"

  const amount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value)
  return amount
}

const TermlyPriceChange = ({ termlyPriceData }) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          {termlyPriceData.map((table, i) => (
            <div
              key={i}
              className={classNames(
                i === 0 ? "" : "mt-4",
                "overflow-hidden border rounded"
              )}
            >
              <table className="table-auto min-w-full">
                {i === 0 && (
                  <thead>
                    <tr className="bg-dark text-white text-left">
                      <th className="py-2 px-4" colSpan={4}>
                        Dönemsel fiyat değişimleri
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
                        Sivri
                      </th>
                      <th
                        scope="col"
                        className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                      >
                        Levant
                      </th>
                      <th
                        scope="col"
                        className="text-sm font-medium text-gray-900 px-2 sm:px-4 py-1 sm:py-2 text-right"
                      >
                        Giresun
                      </th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table ? (
                    table.priceInnerArray.map((term, termI) => (
                      <tr
                        key={termI}
                        className={classNames(
                          termI % 2 ? "" : "bg-lightgray/50",
                          "border-b hover:bg-lightgray"
                        )}
                      >
                        <th className="text-sm font-medium text-darkgray px-2 sm:px-4 py-1 sm:py-2 text-left">
                          {term.name}
                        </th>
                        {term.data.map((item, i) => {
                          if (term.type === 2) {
                            return (
                              <td
                                key={i}
                                className={classNames(
                                  (item.value1 > 0 && "text-up") ||
                                    (item.value1 < 0 && "text-down"),
                                  "text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 text-right"
                                )}
                              >
                                {(100 * item.value1).toFixed(1) + "%"}
                              </td>
                            )
                          } else if (
                            term.type === 0 ||
                            term.type === 3 ||
                            term.type === 4
                          ) {
                            return (
                              <td
                                key={i}
                                className={classNames(
                                  "text-dark text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 text-right"
                                )}
                              >
                                {currencyFormatter(item.value1)}
                              </td>
                            )
                          } else {
                            return (
                              <td
                                key={i}
                                className={classNames(
                                  (item.value1 > 0 && "text-up") ||
                                    (item.value1 < 0 && "text-down"),
                                  "text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 text-right"
                                )}
                              >
                                {currencyFormatter(item.value1)}
                              </td>
                            )
                          }
                        })}
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default TermlyPriceChange
