import React, { useState } from "react"
import Link from "next/link"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import { NumericFormat } from "react-number-format"
import toast from "react-hot-toast"
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
  icvolume: yup
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
})

const RandimanCalculator = () => {
  const [loading, setLoading] = useState(false)
  const [isShowing, setIsShowing] = useState(false)
  const [calculationResult, setCalculationResult] = useState(0)
  return (
    <>
      <Formik
        initialValues={{
          volume: 200,
          icvolume: 100,
        }}
        validationSchema={loggedInSchema}
        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
          setLoading(true)
          try {
            setErrors({ api: null })
            setCalculationResult(
              100 * (parseInt(values.icvolume) / parseInt(values.volume))
            )
            setIsShowing(true)
            resetForm({
              values: {
                volume: 200,
                icvolume: 100,
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
                {isShowing ? (
                  <div className="w-full grid grid-cols-6 md:grid-cols-12 lg:grid-cols-6 gap-3">
                    <div className=" md:col-span-12 lg:col-span-6">
                      <p>
                        Ürününüzün randıman miktarı:
                        <br />
                        <strong className="text-xl text-primary">
                          <NumericFormat
                            displayType="text"
                            value={calculationResult}
                            thousandSeparator="."
                            decimalSeparator=","
                            decimalScale={2}
                          />
                        </strong>
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className="text-secondary hover:text-white border border-secondary rounded bg-transparent hover:bg-secondary px-5 py-2 transition duration-150 ease-out md:ease-in"
                          onClick={() => {
                            setIsShowing(false)
                          }}
                        >
                          Tekrar Hesapla
                        </button>
                        <Link
                          href="/arac/findik-fiyat-hesaplayici"
                          title="Fındık Fiyat Hesaplayıcı"
                          className="text-white hover:text-white border border-secondary hover:border-primary rounded bg-secondary hover:bg-primary px-5 py-2 transition duration-150 ease-out md:ease-in"
                        >
                          Fındık Fiyat Hesaplayıcı
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-6 gap-3">
                      <div className="col-span-6 md:col-span-12 lg:col-span-6">
                        <p>
                          Randıman hesaplama aracını kullanarak fındığınızın
                          randıman hesabını kolaylıkla yapabilirsiniz.
                        </p>
                      </div>
                      <div className="col-span-6">
                        <label
                          htmlFor="volume"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Kabuklu Ürün miktarı
                        </label>
                        <Field
                          as={NumericFormat}
                          thousandSeparator="."
                          decimalSeparator=","
                          suffix={" gram"}
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
                          Kabuklu toplam ürün miktarını giriniz.
                        </p>
                        {errors.volume && touched.volume && (
                          <>
                            <p className="text-danger">{errors.volume}</p>
                          </>
                        )}
                      </div>
                      <div className="col-span-6">
                        <label
                          htmlFor="icvolume"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Fındık içi miktarı
                        </label>
                        <Field
                          as={NumericFormat}
                          thousandSeparator="."
                          decimalSeparator=","
                          suffix={" gram"}
                          allowNegative={false}
                          decimalScale={0}
                          id="icvolume"
                          name="icvolume"
                          //onValueChange={(value) => console.log(value.floatValue)}
                          className={classNames(
                            errors.volume && touched.volume
                              ? "border-danger"
                              : "border-midgray",
                            "mt-1 block w-full px-3 py-2 text-right rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          )}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Kırımdan sonra elinizde bulunan iç fındık miktarını
                          giriniz.
                        </p>
                        {errors.volume && touched.volume && (
                          <>
                            <p className="text-danger">{errors.volume}</p>
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
                    </div>
                  </>
                )}
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </>
  )
}

export default RandimanCalculator
