import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSelector } from "react-redux"
import { fetchAPI } from "utils/api"
import { Formik, Form, Field } from "formik"
import { NumericFormat } from "react-number-format"
import { Transition } from "@headlessui/react"
import { MdAddChart } from "react-icons/md"
import { BiLoaderCircle } from "react-icons/bi"
import * as yup from "yup"
import toast from "react-hot-toast"
import Dialog from "@/components/elements/dialog"
import Moment from "moment"
import "moment/locale/tr"

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
  city: yup.string().ensure().required("Lütfen Seçiniz!"),
  date: yup.date().max(new Date(), "Geçerli bir tarih giriniz!"),
  volume: yup
    .string()
    .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
      var number = Number(
        parseInt(value ? value.replaceAll(".", "").slice(0, -3) : 1)
      )
      if (number > 999999 || number < 1) {
        return false
      } else {
        return true
      }
    }),
  efficiency: yup
    .string()
    .test("Invalid", "Geçersiz bir rakam girdiniz!", function (value) {
      var number = Number(parseInt(value ? value.replaceAll(",", ".") : 0))
      if (number > 60 || number < 40) {
        return false
      } else {
        return true
      }
    }),
  term: yup
    .bool()
    .oneOf([true], "Yorum yazma kurallarını onaylamanız gereklidir!"),
})
const AddPrice = ({ product, cityData }) => {
  const [cities, setCityList] = useState([])
  const userData = useSelector((state) => state.user.userData)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const [isShowing, setIsShowing] = useState(false)
  const [detailShowing, SetDetailShowing] = useState(false)

  useEffect(() => {
    isShowing &&
      fetchAPI("/cities", {
        filters: {
          prices: {
            product: {
              id: {
                $eq: product,
              },
            },
          },
        },
        fields: ["title", "slug"],
        sort: ["title:asc"],
        pagination: {
          start: 0,
          limit: 100,
        },
      }).then((data) => {
        setCityList(data)
      })
  }, [isShowing, product])

  return (
    <>
      <div className="flex flex-row items-center justify-between border-b border-secondary/20 relative">
        <h2 className="font-semibold text-base text-midgray">FİYAT GİR</h2>
        <MdAddChart className="text-lg text-midgray" />
        <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
      </div>

      <Formik
        initialValues={{
          price: "",
          date: Moment(new Date()).format("YYYY-MM-DD"),
          productType: "",
          city: cityData ? cityData.id : "",
          volume: "",
          efficiency: 50,
          term: false,
        }}
        validationSchema={loggedInSchema}
        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
          setLoading(true)
          try {
            setErrors({ api: null })
            await fetch("/api/client")
              .then((res) => res.json())
              .then((clientIP) => {
                fetchAPI(
                  "/prices",
                  {},
                  {
                    method: "POST",
                    body: JSON.stringify({
                      data: {
                        date: Moment(values.date)
                          .utcOffset(3)
                          .set("hour", Moment().hour())
                          .set("minute", Moment().minutes())
                          .set("second", Moment().seconds())
                          .format("YYYY-MM-DD HH:mm:ss"),
                        article: null,
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
                            ? values.efficiency.toString().replace(",", ".")
                            : 50
                        ),
                        product: product,
                        approvalStatus: "waiting",
                        type: "openmarket",
                        city: values.city,
                        user: session ? userData.id : null,
                        ip: clientIP.ip,
                      },
                    }),
                  }
                )
                notify("success", "Fiyat girişiniz alındı, teşekkür ederiz.")
                resetForm({
                  values: {
                    price: "",
                    date: Moment(new Date()).format("YYYY-MM-DD"),
                    productType: "",
                    city: cityData.id,
                    volume: "",
                    efficiency: 50,
                    term: false,
                  },
                })
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
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-6">
                    <p>
                      <u>Serbest piyasa</u> ürün fiyatını diğer üreticilerle
                      paylaşmaya ne dersiniz? Sattığınız ya da tüccardan
                      öğrendiğiniz fiyatı girebilirsiniz.
                    </p>
                    {!isShowing && (
                      <p className="mt-2">
                        <button
                          type="button"
                          className="text-white hover:text-secondary border border-secondary rounded bg-secondary hover:bg-transparent px-5 py-2 transition duration-150 ease-out md:ease-in"
                          onClick={() => {
                            setIsShowing(true)
                          }}
                        >
                          Fiyat Gir
                        </button>
                      </p>
                    )}
                  </div>
                  <Transition
                    show={isShowing}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo=""
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                    className="col-span-6 grid grid-cols-6 md:grid-cols-12 lg:grid-cols-6 gap-3"
                  >
                    <div className="col-span-6">
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Ürün Fiyatı
                      </label>
                      <Field
                        as={NumericFormat}
                        thousandSeparator="."
                        decimalSeparator=","
                        autoComplete="off"
                        prefix={"₺"}
                        allowNegative={false}
                        decimalScale={2}
                        name="price"
                        className={classNames(
                          errors.price && touched.price
                            ? "border-danger"
                            : "border-midgray",
                          "mt-1 block w-full px-3 py-2 text-right rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        )}
                      />
                      {errors.price && touched.price && (
                        <>
                          <p className="text-danger">{errors.price}</p>
                        </>
                      )}
                    </div>
                    <div className="col-span-6">
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Şehir
                      </label>
                      <Field
                        as="select"
                        name="city"
                        className={classNames(
                          errors.city && touched.city
                            ? "border-danger"
                            : "border-midgray",
                          "mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        )}
                      >
                        <option value={""} disabled defaultValue>
                          Lütfen seçiniz
                        </option>
                        {cities &&
                          cities.data &&
                          cities.data.map((item) => (
                            <option value={item.id} key={item.attributes.slug}>
                              {item.attributes.title}
                            </option>
                          ))}
                      </Field>
                      {errors.city && touched.city && (
                        <>
                          <p className="text-danger">{errors.city}</p>
                        </>
                      )}
                    </div>
                    <div className="col-span-6">
                      <label
                        htmlFor="productType"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Ürün Tipi
                      </label>
                      <Field
                        as="select"
                        name="productType"
                        className={classNames(
                          errors.productType && touched.productType
                            ? "border-danger"
                            : "border-midgray",
                          "mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        )}
                      >
                        <option value={""} disabled defaultValue>
                          Lütfen seçiniz
                        </option>
                        <option>Sivri</option>
                        <option>Levant</option>
                        <option>Giresun</option>
                        <option>Organik</option>
                      </Field>
                      {errors.productType && touched.productType && (
                        <>
                          <p className="text-danger">{errors.productType}</p>
                        </>
                      )}
                    </div>
                    <div className="col-span-6">
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Tarih
                      </label>
                      <Field
                        name="date"
                        type="date"
                        className={classNames(
                          errors.date && touched.date
                            ? "border-danger"
                            : "border-midgray",
                          "mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        )}
                      />
                      {errors.date && touched.date && (
                        <>
                          <p className="text-danger">{errors.date}</p>
                        </>
                      )}
                    </div>
                  </Transition>
                </div>
                <Transition
                  show={detailShowing}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo=""
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                  className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-6 gap-6 pt-6"
                >
                  <div className="col-span-6">
                    <label
                      htmlFor="volume"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Satılan ürün miktarı
                    </label>
                    <Field
                      as={NumericFormat}
                      thousandSeparator="."
                      decimalSeparator=","
                      suffix={" kg"}
                      allowNegative={false}
                      decimalScale={0}
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
                      Satılan ürün randımanı
                    </label>
                    <Field
                      as={NumericFormat}
                      decimalSeparator=","
                      allowNegative={false}
                      decimalScale={2}
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
                </Transition>
                <Transition
                  show={isShowing}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo=""
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <div className="flex flex-col w-3/3 gap-2 my-2">
                    {!detailShowing && (
                      <div className="flex flex-row items-center justify-end">
                        <p>
                          <button
                            className="text-midgray hover:text-secondary hover:underline"
                            type="button"
                            onClick={() => {
                              SetDetailShowing(true)
                            }}
                          >
                            Daha fazla detay
                          </button>
                        </p>
                      </div>
                    )}
                    <div
                      className={classNames(
                        errors.term && touched.term ? "text-danger" : "",
                        "flex flex-row items-center"
                      )}
                    >
                      <Field
                        type="checkbox"
                        name="term"
                        className={classNames(
                          errors.term && touched.term
                            ? "border-gray"
                            : "border-danger",
                          "h-4 w-4 mr-2 text-midgray rounded"
                        )}
                      />
                      <Dialog
                        title={"Fiyat Girişi Kuralları"}
                        content={
                          "Sermaye Piyasaları Kanunu'nun 107. maddesinde fiyat manipülasyonu suçu ve cezai yaptırımı tanımlanmış ve düzenlenmiştir. Dolayısıyla gerçek dışı fiyat girişi yapılması durumunda bu kanundaki suçlar ortaya çıkabilir. Fiyat girişi yapanlar bu sorumluluğu üstlenmiş olurlar. Detaylı bilgi için bakınız: https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6362.pdf"
                        }
                        onConfirm={() => setFieldValue("term", true)}
                        buttons={[
                          {
                            role: "confirm",
                            toClose: true,
                            classes:
                              "bg-secondary text-white px-4 py-2 rounded-lg hover:bg-white border border-transparent hover:border-secondary hover:text-secondary transition-all duration-200",
                            label: "Kabul ediyorum",
                          },
                        ]}
                      >
                        <button
                          type="button"
                          className="underline underline-offset-1 mr-1"
                        >
                          Fiyat girişi kuralları
                        </button>
                        <span>okudum ve kabul ediyorum.</span>
                      </Dialog>
                    </div>
                  </div>
                  {errors.api && (
                    <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                      {errors.api}
                    </p>
                  )}
                  <div className="-mx-6 -mb-6 md:col-span-6">
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
                              <span className="sr-only">Gönderiliyor...</span>
                              <span>Gönderiliyor...</span>
                            </span>
                          ) : (
                            <span>Gönder</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </>
  )
}

export default AddPrice
