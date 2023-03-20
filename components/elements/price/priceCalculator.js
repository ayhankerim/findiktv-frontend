import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useSelector } from "react-redux"
import * as yup from "yup"
import { fetchAPI } from "utils/api"
import { Formik, Form, Field } from "formik"
import { NumericFormat } from "react-number-format"
import toast from "react-hot-toast"
import Moment from "moment"
import "moment/locale/tr"
import { AiOutlineCalculator } from "react-icons/ai"
import { BiLoaderCircle } from "react-icons/bi"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}
const notify = (type, message) => {
  if (type === "success") {
    toast.success(message)
  } else if (type === "error") {
    toast.error(message)
  }
}

const loggedInSchema = yup.object().shape({
  price: yup
    .string()
    .required("Fiyat girmeniz gereklidir!")
    .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
      var number = Number(
        parseInt(value ? value.replaceAll(".", "").slice(1) : 0)
      )
      if (number > 100 || number < 1) {
        return false
      } else {
        return true
      }
    }),
  productType: yup.string().ensure().required("Lütfen Seçiniz!"),
  volume: yup
    .string()
    .required("Miktar girmeniz gereklidir!")
    .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
      var number = Number(parseInt(value ? value : 1)).toLocaleString("tr-TR")
      if (number > 999999 || number < 1) {
        return false
      } else {
        return true
      }
    }),
  efficiency: yup
    .string()
    .required("Randıman girmeniz gereklidir!")
    .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
      var number = Number(parseInt(value ? value.replaceAll(",", ".") : 0))
      if (number > 70 || number < 30) {
        return false
      } else {
        return true
      }
    }),
})
const PriceCalculator = ({ title, product, city, pricetype }) => {
  const userData = useSelector((state) => state.user.userData)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const [isShowing, setIsShowing] = useState(false)
  const [calculationResult, setCalculationResult] = useState(0)
  return (
    <>
      {title && (
        <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative">
          <h3 className="font-semibold text-base text-midgray">
            FİYAT HESAPLAMA
          </h3>
          <AiOutlineCalculator className="text-lg text-midgray" />
          <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
        </div>
      )}
      <Formik
        initialValues={{
          price: "",
          productType: "",
          volume: "1000 kg",
          efficiency: "50",
        }}
        validationSchema={loggedInSchema}
        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
          setLoading(true)
          try {
            setErrors({ api: null })
            await fetch("/api/client")
              .then((res) => res.json())
              .then(async (clientIP) => {
                await fetchAPI(
                  "/prices",
                  {},
                  {
                    method: "POST",
                    body: JSON.stringify({
                      data: {
                        date: Moment(new Date())
                          .utcOffset(3)
                          .format("YYYY-MM-DD HH:mm:ss"),
                        min: Number(
                          values.price.substring(1).replace(",", ".")
                        ),
                        max: Number(
                          values.price.substring(1).replace(",", ".")
                        ),
                        average: Number(
                          values.price.substring(1).replace(",", ".")
                        ),
                        quality: values.productType,
                        volume: values.volume
                          ? Number(
                              parseInt(
                                values.volume
                                  ? values.volume
                                      .replaceAll(".", "")
                                      .slice(0, -3)
                                  : 0
                              )
                            )
                          : 1,
                        efficiency: Number(
                          values.efficiency
                            ? values.efficiency.replace(",", ".")
                            : 50
                        ),
                        product: product,
                        approvalStatus: "calculation",
                        type: "openmarket",
                        city: city,
                        user: session ? userData.id : null,
                        ip: clientIP.ip,
                      },
                    }),
                  }
                )
              })
            setIsShowing(true)
            setCalculationResult(
              Number(values.price.substring(1).replace(",", ".")) *
                Number(
                  parseInt(
                    values.volume
                      ? values.volume.replaceAll(".", "").slice(0, -3)
                      : 0
                  )
                ) *
                [
                  (Number(
                    values.efficiency ? values.efficiency.replace(",", ".") : 50
                  ) *
                    2) /
                    100,
                ]
            )
            resetForm({
              values: {
                price: "",
                productType: "",
                volume: "1000 kg",
                efficiency: "50",
              },
            })
          } catch (err) {
            console.error(err)
            setErrors({ api: err.message })
          }

          setLoading(false)
          setSubmitting(false)
        }}
      >
        {({ errors, touched, isSubmitting, setFieldValue }) => (
          <div className="mt-5 md:col-span-2 md:mt-0 mb-8">
            <Form className="bg-lightgray">
              <div className="px-4 py-5 sm:p-6 lg:px-4 lg:py-5">
                <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-6 gap-3">
                  {isShowing && (
                    <div className="col-span-6">
                      <p>
                        Girmiş olduğunuz rakamlar neticesinde elinize geçecek
                        toplam miktar:
                        <br />
                        <strong className="text-xl text-primary">
                          <NumericFormat
                            displayType="text"
                            value={calculationResult}
                            thousandSeparator="."
                            decimalSeparator=","
                            decimalScale={0}
                            prefix={"₺"}
                          />
                        </strong>
                      </p>
                      <p className="mt-2">
                        <button
                          type="button"
                          className="text-secondary hover:text-white border border-secondary rounded bg-transparent hover:bg-secondary px-5 py-2 transition duration-150 ease-out md:ease-in"
                          onClick={() => {
                            setIsShowing(false)
                          }}
                        >
                          Tekrar Hesapla
                        </button>
                      </p>
                    </div>
                  )}
                  {!isShowing && (
                    <>
                      <div className="col-span-6 md:col-span-12 lg:col-span-6">
                        <p>
                          Fiyat hesaplama aracını kullanarak piyasa ya da kendi
                          girdiğiniz fiyattan elinize geçecek miktarı
                          öğrenebilirsiniz.
                        </p>
                      </div>
                      <div className="col-span-6">
                        <label
                          htmlFor="productType"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Ürün tipi
                        </label>
                        <Field
                          as="select"
                          id="productType"
                          name="productType"
                          onChange={(e) => {
                            fetchAPI("/prices", {
                              filters: {
                                product: {
                                  id: {
                                    $eq: product,
                                  },
                                },
                                type: {
                                  $eq: pricetype,
                                },
                                quality: {
                                  $eq: e.target.value,
                                },
                                approvalStatus: {
                                  $eq: "approved",
                                },
                              },
                              fields: ["average"],
                              sort: ["date:desc"],
                              pagination: {
                                start: 0,
                                limit: 1,
                              },
                            }).then((data) => {
                              setFieldValue(
                                "price",
                                Number(
                                  data.data[0].attributes.average
                                ).toLocaleString("tr-TR", {
                                  style: "currency",
                                  currency: "TRY",
                                }),
                                true
                              )
                            })
                            setFieldValue("productType", e.target.value)
                          }}
                          className={classNames(
                            errors.productType && touched.productType
                              ? "border-danger"
                              : "border-midgray",
                            "mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-secondary focus:outline-none focus:ring-secondary sm:text-sm"
                          )}
                        >
                          <option value={""} disabled defaultValue>
                            Lütfen seçiniz
                          </option>
                          <option>Sivri</option>
                          <option>Levant</option>
                          <option>Giresun</option>
                          {/* <option>Organik</option> */}
                        </Field>
                        {errors.productType && touched.productType && (
                          <>
                            <p className="text-danger">{errors.productType}</p>
                          </>
                        )}
                      </div>
                      <div className="col-span-6">
                        <label
                          htmlFor="price"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Ürün fiyatı
                        </label>
                        <Field
                          as={NumericFormat}
                          thousandSeparator="."
                          decimalSeparator=","
                          autoComplete="off"
                          prefix={"₺"}
                          allowNegative={false}
                          decimalScale={2}
                          id="price"
                          name="price"
                          className={classNames(
                            errors.price && touched.price
                              ? "border-danger"
                              : "border-midgray",
                            "mt-1 block w-full px-3 py-2 text-right rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          )}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Kendi fiyatını girebilirsin. (50 randıman için...)
                        </p>
                        {errors.price && touched.price && (
                          <>
                            <p className="text-danger">{errors.price}</p>
                          </>
                        )}
                      </div>
                      <div className="col-span-6">
                        <label
                          htmlFor="volume"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Ürün miktarı
                        </label>
                        <Field
                          as={NumericFormat}
                          thousandSeparator="."
                          decimalSeparator=","
                          suffix={" kg"}
                          allowNegative={false}
                          decimalScale={0}
                          id="volume"
                          name="volume"
                          //onValueChange={(value) => console.log(value.floatValue)}
                          className={classNames(
                            errors.volume && touched.volume
                              ? "border-danger"
                              : "border-midgray",
                            "mt-1 block w-full px-3 py-2 text-right rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          )}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Kaç kg ürün sattığınızı girebilirsiniz.
                        </p>
                        {errors.volume && touched.volume && (
                          <>
                            <p className="text-danger">{errors.volume}</p>
                          </>
                        )}
                      </div>
                      <div className="col-span-6">
                        <label
                          htmlFor="efficiency"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Ürün randımanı
                        </label>
                        <Field
                          as={NumericFormat}
                          decimalSeparator=","
                          allowNegative={false}
                          decimalScale={2}
                          id="efficiency"
                          name="efficiency"
                          className={classNames(
                            errors.efficiency && touched.efficiency
                              ? "border-danger"
                              : "border-midgray",
                            "mt-1 block w-full px-3 py-2 text-right rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          )}
                        />
                        {errors.efficiency && touched.efficiency && (
                          <>
                            <p className="text-danger">{errors.efficiency}</p>
                          </>
                        )}
                      </div>
                      {errors.api && (
                        <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                          {errors.api}
                        </p>
                      )}
                      <div className="-mx-6 -mb-6 md:-mx-4 col-span-6 md:col-span-12 lg:col-span-6">
                        <div className="bg-lightgray">
                          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                            <button
                              className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                              type="submit"
                              disabled={loading}
                            >
                              {loading ? (
                                <span role="status">
                                  <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                                  <span className="sr-only">
                                    Hesaplanıyor...
                                  </span>
                                  <span>Hesaplanıyor...</span>
                                </span>
                              ) : (
                                <span>Hesapla</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </>
  )
}

export default PriceCalculator
