import React, { useState, useEffect, useRef } from "react"
import { getSession, useSession } from "next-auth/react"
import { useSelector, useDispatch } from "react-redux"
import { updateUser } from "@/store/user"
import axios from "axios"
import { fetchAPI } from "utils/api"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import { badwords } from "@/utils/badwords"
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

const ProfileUpdateForm = () => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user.userData)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const [isShowing, setIsShowing] = useState(false)
  const [cities, setCityList] = useState([])

  useEffect(() => {
    fetchAPI("/cities", {
      fields: ["id", "slug", "title"],
      populate: ["id", "slug", "title"],
      sort: ["title:asc"],
      pagination: {
        start: 0,
        limit: 100,
      },
    }).then((data) => {
      setCityList(data)
    })
  }, [])

  const validCities = cities.data
    ? cities.data.map((item) => item.id.toString())
    : []

  const loggedInSchema = yup.object().shape({
    name: yup
      .string()
      .min(2, "Çok kısa, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!")
      .required("İsminizi girmeniz gereklidir!")
      .test("Bad Word", "Adınız argo ifade içeremez!", function (value) {
        var bad_words = badwords
        var check_text = value
        var error = 0
        for (var i = 0; i < bad_words.length; i++) {
          var val = bad_words[i]
          if (check_text?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1
          }
        }

        if (error > 0) {
          return false
        } else {
          return true
        }
      }),
    surname: yup
      .string()
      .min(2, "Çok kısa, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!"),
    about: yup.string().max(200, "Çok uzun, lütfen kontrol ediniz!"),
    city: yup.string().oneOf(validCities, "Geçersiz bir seçim yaptınız!"),
  })
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Formik
        initialValues={{
          name: userData.name,
          surname: userData.surname,
          city: userData.city.id,
          about: userData.about,
        }}
        validationSchema={loggedInSchema}
        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
          setLoading(true)
          try {
            setErrors({ api: null })
            await fetchAPI(
              `/users/${session.id}`,
              {},
              {
                method: "PUT",
                body: JSON.stringify({
                  name: values.name,
                  surname: values.surname,
                  city: parseInt(values.city),
                  about: values.about,
                }),
              }
            )
            notify("success", "Bilgileriniz güncellenmiştir.")

            try {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/users/me?populate=avatar,city,SystemAvatar,profile_cover`,
                {
                  headers: {
                    Authorization: `Bearer ${session.jwt}`,
                  },
                }
              )
              dispatch(updateUser(response.data))
            } catch (error) {
              console.error(error.message)
            }
            setIsShowing(true)
          } catch (err) {
            console.error(err)
            notify(
              "error",
              "Bilgileriniz kaydedilirken bir sorunla karşılaştık."
            )
            setErrors({ api: err.message })
          }

          setLoading(false)
          setSubmitting(false)
        }}
      >
        {({ errors, touched, isSubmitting, setFieldValue }) => (
          <div className="bg-lightgray border rounded-xl p-3 border-lightgray mt-5 md:col-span-2 md:mt-0 mb-8">
            <Form className="">
              <div className="grid md:grid-cols-2 gap-2 mb-2">
                <div className="flex flex-col col-span-2 sm:col-span-1 gap-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-midgray"
                  >
                    Adınız
                  </label>
                  <Field
                    className={classNames(
                      errors.name && touched.name
                        ? "border-danger"
                        : "border-midgray",
                      "text-base focus:outline-none py-1 px-2 border"
                    )}
                    type="text"
                    name="name"
                    placeholder="Adınız *"
                  />
                  {errors.name && touched.name && (
                    <p className="text-danger">{errors.name}</p>
                  )}
                </div>
                <div className="flex flex-col col-span-2 sm:col-span-1 gap-2">
                  <label
                    htmlFor="surname"
                    className="block text-sm font-medium text-midgray"
                  >
                    Soyadınız
                  </label>
                  <Field
                    className={classNames(
                      errors.surname && touched.surname
                        ? "border-danger"
                        : "border-midgray",
                      "text-base focus:outline-none py-1 px-2 border"
                    )}
                    type="text"
                    name="surname"
                    placeholder="Soyadınız"
                  />
                  {errors.surname && touched.surname && (
                    <p className="text-danger">{errors.surname}</p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-midgray"
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
                      "mt-1 block w-full border border-midgray bg-white py-2 px-3 shadow-sm focus:border-secondary focus:outline-none focus:ring-secondary"
                    )}
                  >
                    <option value={""}>Lütfen seçiniz</option>
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
                <div className="flex flex-col col-span-2 gap-2">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium text-midgray"
                  >
                    Hakkımda
                  </label>
                  <Field
                    className={classNames(
                      errors.name && touched.name
                        ? "border-danger"
                        : "border-midgray",
                      "text-base focus:outline-none py-1 px-2 border"
                    )}
                    as="textarea"
                    name="about"
                    placeholder="Hakkımda"
                    rows={3}
                  />
                  {errors.about && touched.about && (
                    <p className="text-danger">{errors.about}</p>
                  )}
                </div>
                {errors.api && (
                  <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                    {errors.api}
                  </p>
                )}
                <div className="flex flex-col gap-2 col-span-2">
                  <button
                    className="disabled:opacity-75 w-full bg-secondary hover:bg-secondary/90 text-white rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span role="status">
                        <BiLoaderCircle className="mr-2 inline-block align-middle w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                        <span className="sr-only">Kaydediliyor...</span>
                        <span>Kaydediliyor...</span>
                      </span>
                    ) : (
                      <span>Kaydet</span>
                    )}
                  </button>
                </div>
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </>
  )
}

export default ProfileUpdateForm
