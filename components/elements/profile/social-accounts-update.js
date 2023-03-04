import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import * as Yup from "yup"
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik"
import toast, { Toaster } from "react-hot-toast"
import { fetchAPI } from "utils/api"
import { TiDeleteOutline } from "react-icons/ti"
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

const SocialAccountsUpdate = (accounts) => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [isShowing, setIsShowing] = useState(false)
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="bg-lightgray border rounded-xl p-3 border-lightgray mt-5 md:col-span-2 md:mt-0 mb-8">
        <Formik
          initialValues={{
            SocialAccounts: [
              {
                Account: accounts.accounts[0]?.Account,
                Link: accounts.accounts[0]?.Link,
              },
              {
                Account: accounts.accounts[1]?.Account,
                Link: accounts.accounts[1]?.Link,
              },
              {
                Account: accounts.accounts[2]?.Account,
                Link: accounts.accounts[2]?.Link,
              },
              {
                Account: accounts.accounts[3]?.Account,
                Link: accounts.accounts[3]?.Link,
              },
              {
                Account: accounts.accounts[4]?.Account,
                Link: accounts.accounts[4]?.Link,
              },
              {
                Account: accounts.accounts[5]?.Account,
                Link: accounts.accounts[5]?.Link,
              },
              {
                Account: accounts.accounts[6]?.Account,
                Link: accounts.accounts[6]?.Link,
              },
            ],
          }}
          validationSchema={Yup.object({
            SocialAccounts: Yup.array().of(
              Yup.object().shape({
                Account: Yup.string().oneOf(
                  ["Facebook", "Twitter", "LinkedIn", "Telegram", "Youtube"],
                  "Geçersiz bir seçim yaptınız!"
                ),
                Link: Yup.string()
                  .matches(
                    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-@]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                    "Hatalı bir giriş yaptınız!"
                  )
                  .required("Hesap bağlantınızı giriniz!"),
              })
            ),
          })}
          //onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
          onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
            setLoading(true)
            try {
              setErrors({ api: null })
              await fetchAPI(
                `/users/${session.id}`,
                {},
                {
                  method: "PUT",
                  body: JSON.stringify(values),
                }
              )
              notify("success", "Bilgileriniz güncellenmiştir.")
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
          {({ errors, touched, values }) => (
            <Form>
              <FieldArray
                name="SocialAccounts"
                render={(arrayHelpers) => {
                  const SocialAccounts = values.SocialAccounts
                  return (
                    <div className="flex flex-col gap-2">
                      {SocialAccounts && SocialAccounts.length > 0
                        ? SocialAccounts.filter(
                            (account) => account.Link != null
                          ).map((account, index) => (
                            <div
                              className={classNames(
                                index % 2 == 0 ? "bg-lightgray" : "",
                                "flex flex-row gap-2 items-start justify-center"
                              )}
                              key={index}
                            >
                              <div className="flex flex-col w-4/12">
                                <Field
                                  as="select"
                                  className="text-base focus:outline-none py-1 px-2 border border-midgray focus:border-secondary focus:outline-none focus:ring-secondary"
                                  placeholder="user name"
                                  name={`SocialAccounts.${index}.Account`}
                                >
                                  <option value={""}>Lütfen seçiniz</option>
                                  {[
                                    "Facebook",
                                    "Twitter",
                                    "LinkedIn",
                                    "Telegram",
                                    "Youtube",
                                  ].map((item, i) => (
                                    <option value={item} key={i}>
                                      {item}
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage
                                  name={`SocialAccounts.${index}.Account`}
                                >
                                  {(msg) => (
                                    <span className="text-danger">{msg}</span>
                                  )}
                                </ErrorMessage>
                              </div>
                              <div className="flex flex-col w-7/12">
                                <Field
                                  placeholder="Hesap web adresi"
                                  className="text-base focus:outline-none py-1 px-2 border border-midgray focus:border-secondary focus:outline-none focus:ring-secondary"
                                  name={`SocialAccounts.${index}.Link`}
                                />
                                <ErrorMessage
                                  name={`SocialAccounts.${index}.Link`}
                                >
                                  {(msg) => (
                                    <span className="text-danger">{msg}</span>
                                  )}
                                </ErrorMessage>
                              </div>
                              <button
                                type="button"
                                className="text-danger text-center w-1/12 leading-8"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <TiDeleteOutline className="text-lg inline-block" />
                              </button>
                            </div>
                          ))
                        : null}
                      {SocialAccounts.filter((account) => account.Link != null)
                        .length < 6 && (
                        <div className="flex justify-start">
                          <button
                            type="button"
                            className="border border-secondary px-2 py-1"
                            onClick={() =>
                              arrayHelpers.push({
                                Account: "",
                                Link: "",
                              })
                            }
                          >
                            Yeni hesap ekle
                          </button>
                        </div>
                      )}
                      <div className="flex justify-start">
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
                  )
                }}
              />
              <hr />
            </Form>
          )}
        </Formik>
      </div>
    </>
  )
}
export default SocialAccountsUpdate
