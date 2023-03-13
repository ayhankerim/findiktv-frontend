import React, { useState } from "react"
import Router from "next/router"
import { useSession } from "next-auth/react"
import { useSelector, useDispatch } from "react-redux"
import { updateUser } from "@/store/user"
import axios from "axios"
import { fetchAPI } from "utils/api"
import { badwords } from "@/utils/badwords"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import { BiLoaderCircle } from "react-icons/bi"
import Link from "next/link"

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

const ProfileBasicPass = () => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user.userData)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const [isShowing, setIsShowing] = useState(false)

  const passwordSchema = yup.object().shape({
    currentPassword: yup
      .string()
      .min(6, "Çok kısa, en az 6 karakter, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!")
      .required("Şifre girilmesi gereklidir!"),
    password: yup
      .string()
      .min(6, "Çok kısa, en az 6 karakter, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!")
      .required("Şifre girilmesi gereklidir!"),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password"), null],
        "Şifreler uyuşmuyor, lütfen kontrol ediniz!"
      )
      .required("Şifre girilmesi gereklidir!"),
  })

  const accountSchema = yup.object().shape({
    username: yup
      .string()
      .required("Lütfen bir kullanıcı adı belirleyiniz!")
      .min(4, "Çok kısa, lütfen kontrol ediniz!")
      .max(20, "Çok uzun, lütfen kontrol ediniz!")
      .test(
        "Unique Username",
        "Bu kullanıcı adı alınmış ya da yasaklıdır! Farklı bir isim deneyiniz!", // <- key, message
        function (value) {
          var error = 0
          for (var i = 0; i < badwords.length; i++) {
            var val = badwords[i]
            if (value?.toLowerCase().indexOf(val.toString()) > -1) {
              error = error + 1
            }
          }
          return new Promise((resolve, reject) => {
            const restricted = ["admin", "administrator", "findiktv"]
            if (value && value.length > 3) {
              if (!restricted.includes(value) && error === 0) {
                fetchAPI(
                  `/users?filters[username][$eq]=${value}&filters[confirmed][$eq]=true&fields[0]=username`,
                  {},
                  {
                    method: "GET",
                  }
                ).then((data) => {
                  if (data.length > 0) {
                    resolve(false)
                  } else {
                    resolve(true)
                  }
                })
              } else {
                resolve(false)
              }
            } else {
              resolve(true)
            }
          })
        }
      ),
  })
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Formik
        initialValues={{
          currentPassword: "",
          password: "",
          passwordConfirmation: "",
        }}
        validationSchema={passwordSchema}
        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
          setLoading(true)
          try {
            setErrors({ api: null })
            await axios.post(
              "/api/auth/change-password",
              {
                currentPassword: values.currentPassword,
                password: values.password,
                passwordConfirmation: values.passwordConfirmation,
              },
              {
                headers: {
                  Authorization: `Bearer ${session.jwt}`,
                },
              }
            )

            notify("success", "Bilgileriniz güncellenmiştir.")
            setIsShowing(true)
            resetForm({
              values: {
                currentPassword: "",
                password: "",
                passwordConfirmation: "",
              },
            })
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
          <>
            <div className="flex flex-row items-center justify-between relative">
              <h2 className="font-semibold text-base text-midgray">
                Şifre Değiştir
              </h2>
              <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
            </div>
            <div className="flex flex-wrap bg-lightgray border rounded-b-xl rounded-r-xl p-3 border-lightgray mb-2">
              <Form className=" w-full">
                <div className="grid md:grid-cols-2 gap-2 mb-2">
                  <div className="flex flex-col col-span-2 sm:col-span-2 gap-2">
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-midgray"
                    >
                      Mevcut şifreniz
                    </label>
                    <Field
                      className={classNames(
                        errors.currentPassword && touched.currentPassword
                          ? "border-danger"
                          : "border-midgray",
                        "text-base focus:outline-none py-1 px-2 border"
                      )}
                      type="password"
                      name="currentPassword"
                      placeholder="Mevcut şifreniz"
                    />
                    {errors.currentPassword && touched.currentPassword && (
                      <p className="text-danger">{errors.currentPassword}</p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1 gap-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-midgray"
                    >
                      Yeni şifreniz
                    </label>
                    <Field
                      className={classNames(
                        errors.password && touched.password
                          ? "border-danger"
                          : "border-midgray",
                        "text-base focus:outline-none py-1 px-2 border"
                      )}
                      type="password"
                      name="password"
                      placeholder="Yeni şifreniz"
                    />
                    {errors.password && touched.password && (
                      <p className="text-danger">{errors.password}</p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1 gap-2">
                    <label
                      htmlFor="passwordConfirmation"
                      className="block text-sm font-medium text-midgray"
                    >
                      Yeni şifre (tekrar)
                    </label>
                    <Field
                      className={classNames(
                        errors.passwordConfirmation &&
                          touched.passwordConfirmation
                          ? "border-danger"
                          : "border-midgray",
                        "text-base focus:outline-none py-1 px-2 border"
                      )}
                      type="password"
                      name="passwordConfirmation"
                      placeholder="Adınız *"
                    />
                    {errors.passwordConfirmation &&
                      touched.passwordConfirmation && (
                        <p className="text-danger">
                          {errors.passwordConfirmation}
                        </p>
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
                        <span>Şifre Değiştir</span>
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </>
        )}
      </Formik>

      <Formik
        initialValues={{
          username: userData.username,
          email: userData.email,
        }}
        validationSchema={accountSchema}
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
                  username: values.username,
                }),
              }
            )

            try {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/me?populate=avatar,city,SystemAvatar,profile_cover`,
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
            notify("success", "Bilgileriniz güncellenmiştir.")
            setIsShowing(true)
            setTimeout(() => {
              Router.push("/")
            }, 2000)
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
          <>
            <div className="flex flex-row items-center justify-between relative">
              <h2 className="font-semibold text-base text-midgray">
                Kullanıcı Adını Değiştir
              </h2>
              <span className="absolute h-[5px] w-2/5 max-w-[180px] left-0 bottom-[-5px] bg-secondary/60"></span>
            </div>
            <div className="flex flex-wrap bg-lightgray border rounded-b-xl rounded-r-xl p-3 border-lightgray mb-2">
              <Form className="w-full">
                <div className="grid md:grid-cols-2 gap-2 mb-2">
                  <div className="flex flex-col col-span-2 sm:col-span-2 gap-2">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-midgray"
                    >
                      Kullanıcı adınız
                    </label>
                    <Field
                      className={classNames(
                        errors.username && touched.username
                          ? "border-danger"
                          : "border-midgray",
                        "text-base focus:outline-none py-1 px-2 border"
                      )}
                      type="text"
                      name="username"
                      placeholder="Kullanıcı adınız"
                    />
                    {errors.username && touched.username && (
                      <p className="text-danger">{errors.username}</p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-2 gap-2 mb-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-midgray"
                    >
                      E-posta adresiniz
                    </label>
                    <Field
                      className={classNames(
                        errors.email && touched.email
                          ? "border-danger"
                          : "border-midgray",
                        "text-base text-midgray focus:outline-none py-1 px-2 border"
                      )}
                      type="email"
                      name="email"
                      disabled
                    />
                    <p className="text-dark/70">
                      E-posta adresinizi değiştirmek için{" "}
                      <Link
                        className="text-secondary font-bold"
                        href="mailto:info@findiktv.com"
                      >
                        info@findiktv.com
                      </Link>
                      `a e-posta atabilirsiniz.
                    </p>
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
                        <span>Kullanıcı Adı Değiştir</span>
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </>
        )}
      </Formik>
    </>
  )
}

export default ProfileBasicPass
