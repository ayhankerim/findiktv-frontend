import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { fetchAPI } from "utils/api"
import * as yup from "yup"
import { Formik, Form, Field } from "formik"
import toast, { Toaster } from "react-hot-toast"
import Dialog from "@/components/elements/dialog"
import { badwords } from "@/utils/badwords"
import { Transition } from "@headlessui/react"
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

export default function CommentForm({
  userData,
  article,
  product,
  city,
  replyto,
  threadOf,
  commentId,
  onNewComment = "",
  children,
}) {
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const [isShowing, setIsShowing] = useState(false)

  const loggedInSchema = yup.object().shape({
    content: yup
      .string()
      .min(14, "Çok kısa yorum girdiniz!")
      .max(1000, "Maksimum 1000 karakter olacak şekilde yorum ekleyeblirsiniz!")
      .required("Yorum eklemeniz gereklidir!")
      .test("Bad Word", "Yorum argo ifade içeremez!", function (value) {
        var error = 0
        for (var i = 0; i < badwords.length; i++) {
          var val = badwords[i]
          if (value?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1
          }
        }
        if (error > 0) {
          return false
        } else {
          return true
        }
      }),
    term: yup
      .bool()
      .oneOf([true], "Yorum yazma kurallarını onaylamanız gereklidir!"),
  })

  const notloggedInSchema = yup.object().shape({
    content: yup
      .string()
      .min(14, "Çok kısa yorum girdiniz!")
      .max(1000, "Maksimum 1000 karakter olacak şekilde yorum ekleyeblirsiniz!")
      .required("Yorum eklemeniz gereklidir!")
      .test("Bad Word", "Yorum argo ifade içeremez!", function (value) {
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
    email: yup
      .string()
      .email("Lütfen geçerli bir mail adresi giriniz!")
      .required("E-posta adresi gereklidir!")
      .test(
        "Unique Email",
        "Bu mail adresi kayıtlı! <a class='underline' href='/hesap/giris-yap'>Giriş</a> yapmanız gerekiyor.", // <- key, message
        function (value) {
          return new Promise((resolve, reject) => {
            if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{1,4}$/i.test(value)) {
              fetchAPI(
                `/users?filters[email][$eq]=${value}&filters[confirmed][$eq]=true&fields[0]=email`,
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
              resolve(true)
            }
          })
        }
      ),
    password: yup
      .string()
      .min(6, "Çok kısa, en az 6 karakter, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!"),
    term: yup
      .bool()
      .oneOf([true], "Yorum yazma kurallarını onaylamanız gereklidir!"),
  })
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Formik
        initialValues={{
          content: "",
          email: session ? userData?.email : "",
          name: session ? userData?.name : "",
          surname: session ? userData?.surname : "",
          term: false,
        }}
        enableReinitialize
        validationSchema={session ? loggedInSchema : notloggedInSchema}
        //validateOnChange={false}
        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
          setLoading(true)
          await fetch("/api/client")
            .then((res) => res.json())
            .then(async (clientIP) => {
              if (session) {
                try {
                  setErrors({ api: null })
                  await fetchAPI(
                    "/comments",
                    {},
                    {
                      method: "POST",
                      body: JSON.stringify({
                        data: {
                          article: article,
                          product: product,
                          city: city,
                          threadOf: threadOf ? threadOf : null,
                          reply_to: replyto ? replyto : null,
                          user: session.id,
                          content: values.content,
                          approvalStatus: "approved",
                          ip: clientIP,
                        },
                      }),
                    }
                  )
                  notify("success", "Yorumunuz eklendi.")
                  resetForm({
                    values: {
                      content: "",
                    },
                  })
                  onNewComment()
                } catch (err) {
                  console.error(err)
                  setErrors({ api: err.message })
                }
              } else {
                try {
                  setErrors({ api: null })
                  fetchAPI(
                    `/users?filters[email][$eq]=${values.email}&filters[confirmed][$eq]=false&fields[0]=email`,
                    {},
                    {
                      method: "GET",
                    }
                  ).then(async (user) => {
                    if (user.length > 0) {
                      await fetchAPI(
                        "/comments",
                        {},
                        {
                          method: "POST",
                          body: JSON.stringify({
                            data: {
                              article: article,
                              product: product,
                              city: city,
                              threadOf: threadOf ? threadOf : null,
                              reply_to: replyto ? replyto : null,
                              user: user[0].id,
                              content: values.content,
                              ip: clientIP.ip,
                            },
                          }),
                        }
                      )
                    } else {
                      fetchAPI(
                        `/auth/local/register`,
                        {},
                        {
                          method: "POST",
                          body: JSON.stringify({
                            username: Math.random().toString(36).slice(5),
                            email: values.email,
                            name: values.name,
                            surname: values.surname,
                            role: 3,
                            confirmed: false,
                            password: values.password
                              ? values.password
                              : Math.random().toString(36).slice(2) +
                                Math.random().toString(36).slice(2),
                          }),
                        }
                      ).then(async (data) => {
                        fetchAPI(
                          "/comments",
                          {},
                          {
                            method: "POST",
                            body: JSON.stringify({
                              data: {
                                article: article,
                                product: product,
                                city: city,
                                threadOf: threadOf ? threadOf : null,
                                reply_to: replyto ? replyto : null,
                                user: data.user.id,
                                content: values.content,
                                ip: clientIP.ip,
                              },
                            }),
                          }
                        )
                      })
                    }
                  })
                  notify(
                    "success",
                    "Yorumunuz eklendi. Moderatörlerin onayının ardından yayına alınacaktır."
                  )
                  resetForm({
                    values: {
                      content: "",
                    },
                  })
                  onNewComment()
                } catch (err) {
                  setErrors({ api: err.message })
                }
              }
            })

          setLoading(false)
          setSubmitting(false)
        }}
      >
        {({ errors, touched, isSubmitting, setFieldValue }) => (
          <div className={`commentId${commentId}`}>
            <Form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 mt-2">
                <Field
                  component="textarea"
                  name="content"
                  placeholder="Yorumunuz..."
                  rows={3}
                  onClick={() => {
                    setIsShowing(true)
                  }}
                  className={classNames(
                    errors.content && touched.content
                      ? "border-danger"
                      : "border-midgray",
                    "text-base focus:outline-none p-2 border"
                  )}
                />
                {errors.content && (
                  <>
                    <p className="text-danger">{errors.content}</p>
                  </>
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
              >
                <div className="flex flex-col w-3/3 gap-2 mb-2">
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
                      title={"Yorum Yazma Kuralları"}
                      content={
                        "Üye/Üyeler suç teşkil edecek, yasal açıdan takip gerektirecek, yasaların ya da uluslararası anlaşmaların ihlali sonucunu doğuran ya da böyle durumları teşvik eden, yasadışı, tehditkar, rahatsız edici, hakaret ve küfür içeren, aşağılayıcı, küçük düşürücü, kaba, pornografik ya da ahlaka aykırı, toplumca genel kabul görmüş kurallara aykırı, kişilik haklarına zarar verici ya da benzeri niteliklerde hiçbir İçeriği bu web sitesinin hiçbir sayfasında ya da subdomain olarak oluşturulan diğer sayfalarında paylaşamaz. Bu tür içeriklerden doğan her türlü mali, hukuki, cezai, idari sorumluluk münhasıran, içeriği gönderen Üye/Üyeler’e aittir. FINDIK TV, Üye/Üyeler tarafından paylaşılan içerikler arasından uygun görmediklerini herhangi bir gerekçe belirtmeksizin kendi web sayfalarında yayınlamama veya yayından kaldırma hakkına sahiptir. FINDIK TV, başta yukarıda sayılan hususlar olmak üzere emredici kanun hükümlerine aykırılık gerekçesi ile her türlü adli makam tarafından başlatılan soruşturma kapsamında kendisinden Ceza Muhakemesi Kanunu’nun 332.maddesi doğrultusunda istenilen Üye/Üyeler’e ait kişisel bilgileri paylaşabileceğini beyan eder. "
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
                        Yorum yazma kurallarını
                      </button>
                      <span>okudum ve kabul ediyorum.</span>
                    </Dialog>
                  </div>
                </div>
                {!session && (
                  <div className="grid md:grid-cols-2 gap-2 mb-2">
                    <div className="flex flex-col gap-2">
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
                    <div className="flex flex-col gap-2">
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
                    <div className="flex flex-col gap-2">
                      <Field
                        className={classNames(
                          errors.email && touched.email
                            ? "border-danger"
                            : "border-midgray",
                          "text-base focus:outline-none py-1 px-2 border"
                        )}
                        type="email"
                        name="email"
                        placeholder="E-Posta *"
                      />
                      {errors.email && touched.email && (
                        <p
                          className="text-danger"
                          dangerouslySetInnerHTML={{
                            __html: errors.email,
                          }}
                        />
                      )}
                    </div>
                    {!errors.email && touched.email && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <Field
                            className={classNames(
                              errors.password && touched.password
                                ? "border-danger"
                                : "border-midgray",
                              "text-base focus:outline-none py-1 px-2 border"
                            )}
                            type="password"
                            name="password"
                            placeholder="Şifre"
                          />
                          <p className="mt-2 text-sm text-gray-500">
                            Sadece şifre girerek hesabını oluşturabilirsin.
                          </p>
                        </div>
                        {errors.password && touched.email && (
                          <p className="text-danger">{errors.password}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {errors.api && (
                  <p className="text-red-500 h-12 text-sm mt-1 ml-2 text-left">
                    {errors.api}
                  </p>
                )}
                <div className="flex flex-row gap-2">
                  {children}
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
              </Transition>
            </Form>
          </div>
        )}
      </Formik>
    </>
  )
}
