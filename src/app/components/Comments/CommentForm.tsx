"use client";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { Formik, Form, Field } from "formik";
import toast, { Toaster } from "react-hot-toast";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import { fetchAPI } from "@/app/utils/fetch-api";
import { badwords } from "@/app/utils/badwords";
import { Transition } from "@headlessui/react";
import { CommentFormValues, Session } from "@/app/utils/model";
import Dialog from "@/app/components/Dialog";
import { addComments, registerUser } from "@/app/utils/comment-api";
import { BiLoaderCircle } from "react-icons/bi";

const notify = (type: string, message: string) => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  }
};
const CommentForm = ({
  cancelButton,
  article,
  product,
  city,
  replyto,
  threadOf,
  commentLimit,
  commentLimitFunc,
  commentReply,
}: {
  cancelButton: boolean | false;
  article: number;
  product: number | null;
  city: number | null;
  replyto: number | null;
  threadOf: number | null;
  commentLimit: number;
  commentLimitFunc: (limit: number) => void;
  commentReply: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState(false);
  const { data } = useSession();
  const session = data as Session | null;
  const [isShowing, setIsShowing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/users`;

  const loggedInSchema = yup.object().shape({
    content: yup
      .string()
      .min(14, "Çok kısa yorum girdiniz!")
      .max(
        1000,
        "Maksimum 1000 karakter olacak şekilde yorum ekleyebilirsiniz!"
      )
      .required("Yorum eklemeniz gereklidir!")
      .test("Bad Word", "Yorum argo ifade içeremez!", function (value) {
        var error = 0;
        for (var i = 0; i < badwords.length; i++) {
          var val = badwords[i];
          if (value?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1;
          }
        }
        if (error > 0) {
          return false;
        } else {
          return true;
        }
      }),
    term: yup
      .bool()
      .oneOf([true], "Yorum yazma kurallarını onaylamanız gereklidir!"),
  });

  const anonymousSchema = yup.object().shape({
    content: yup
      .string()
      .min(14, "Çok kısa yorum girdiniz!")
      .max(
        1000,
        "Maksimum 1000 karakter olacak şekilde yorum ekleyebilirsiniz!"
      )
      .required("Yorum eklemeniz gereklidir!")
      .test("Bad Word", "Yorum argo ifade içeremez!", function (value) {
        var bad_words = badwords;
        var check_text = value;
        var error = 0;
        for (var i = 0; i < bad_words.length; i++) {
          var val = bad_words[i];
          if (check_text?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1;
          }
        }

        if (error > 0) {
          return false;
        } else {
          return true;
        }
      }),
    name: yup
      .string()
      .min(2, "Çok kısa, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!")
      .required("İsminizi girmeniz gereklidir!")
      .test("Bad Word", "Adınız argo ifade içeremez!", function (value) {
        var bad_words = badwords;
        var check_text = value;
        var error = 0;
        for (var i = 0; i < bad_words.length; i++) {
          var val = bad_words[i];
          if (check_text?.toLowerCase().indexOf(val.toString()) > -1) {
            error = error + 1;
          }
        }

        if (error > 0) {
          return false;
        } else {
          return true;
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
        "Bu mail adresi kayıtlı! <a class='underline' href='/hesap/giris-yap'>Giriş</a> yapmanız gerekiyor.",
        function async(value: string) {
          return new Promise(async (resolve, reject) => {
            if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{1,4}$/i.test(value)) {
              const urlParamsObject = {
                filters: {
                  email: {
                    $eq: value,
                  },
                },
                fields: ["email", "confirmed"],
              };
              const options = { headers: { Authorization: `Bearer ${token}` } };
              try {
                const responseData = await fetchAPI(
                  path,
                  urlParamsObject,
                  options
                );
                if (responseData.length > 0) {
                  if (responseData[0].confirmed) {
                    setUserId(null);
                    resolve(false);
                  } else {
                    setUserId(responseData[0].id);
                    resolve(true);
                  }
                } else {
                  setUserId(null);
                  setShow(true);
                  resolve(true);
                }
              } catch (error) {
                reject(error);
              }
            } else {
              resolve(true);
            }
          });
        }
      ),
    password: yup
      .string()
      .min(6, "Çok kısa, en az 6 karakter, lütfen kontrol ediniz!")
      .max(30, "Çok uzun, lütfen kontrol ediniz!"),
    term: yup
      .bool()
      .oneOf([true], "Yorum yazma kurallarını onaylamanız gereklidir!"),
  });
  function CommentSent(comment: number) {
    setSent(true);
    const element = document.querySelector(`#comment-${String(comment)}`);
    setTimeout(() => {
      commentReply();
      setSent(false);
      if (element instanceof HTMLElement) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 5000);
  }
  useEffect(() => {
    session && setUserId(session.id);
  }, [session, setUserId]);
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {sent ? (
        <div className="flex justify-center items-center w-full text-center h-[100px] rounded outline outline-offset-4 outline-1 outline-success text-success bg-success/10 border-success my-4">
          <p>Gönderildi</p>
        </div>
      ) : (
        <Formik
          initialValues={{
            content: "",
            email: session ? session.user.data.email : "",
            name: session ? session.user.data.name : "",
            surname: session ? session.user.data.surname : "",
            password: "",
            term: false,
            api: "",
          }}
          enableReinitialize
          validationSchema={session ? loggedInSchema : anonymousSchema}
          //validateOnChange={false}
          onSubmit={async (
            values: CommentFormValues,
            { setSubmitting, setErrors, resetForm }
          ) => {
            setLoading(true);
            setErrors({ api: "" });
            const response = await fetch("/api/client");
            const clientIP = await response.json();
            try {
              setErrors({ api: "" });
              const registeredUser =
                (!userId && (await registerUser(values))) || [];
              setUserId(userId ? userId : registeredUser.user.id);
              const addedComment =
                (await addComments(
                  values,
                  article,
                  product,
                  city,
                  threadOf,
                  replyto,
                  userId ? userId : registeredUser.user.id,
                  clientIP.ip
                )) || [];
              notify("success", "Yorumunuz eklendi.");
              commentLimitFunc(commentLimit);
              CommentSent(addedComment.data.id);
              resetForm();
              console.log(addedComment);
            } catch (err: any) {
              console.error(err);
              setErrors({ api: err.message });
            }
            setLoading(false);
            setSubmitting(false);
          }}
        >
          {({ errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="flex flex-col gap-4 p-4 bg-lightgray">
              <div className="flex flex-col gap-2 mt-2">
                <Field
                  component="textarea"
                  name="content"
                  placeholder="Yorumunuz..."
                  rows={3}
                  onClick={() => {
                    setIsShowing(true);
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
                        "Üye/Üyeler suç teşkil edecek, yasal açıdan takip gerektirecek, yasaların ya da uluslararası anlaşmaların ihlali sonucunu doğuran ya da böyle durumları teşvik eden, yasadışı, tehditkar, rahatsız edici, hakaret ve küfür içeren, aşağılayıcı, küçük düşürücü, kaba, pornografik ya da ahlaka aykırı, toplumca genel kabul görmüş kurallara aykırı, kişilik haklarına zarar verici ya da benzeri niteliklerde hiçbir içeriği bu web sitesinin hiçbir sayfasında ya da subdomain olarak oluşturulan diğer sayfalarında paylaşamaz. Bu tür içeriklerden doğan her türlü mali, hukuki, cezai, idari sorumluluk münhasıran, içeriği gönderen Üye/Üyeler’e aittir. FINDIK TV, Üye/Üyeler tarafından paylaşılan içerikler arasından uygun görmediklerini herhangi bir gerekçe belirtmeksizin kendi web sayfalarında yayınlamama veya yayından kaldırma hakkına sahiptir. FINDIK TV, başta yukarıda sayılan hususlar olmak üzere emredici kanun hükümlerine aykırılık gerekçesi ile her türlü adli makam tarafından başlatılan soruşturma kapsamında kendisinden Ceza Muhakemesi Kanunu’nun 332.maddesi doğrultusunda istenilen Üye/Üyeler’e ait kişisel bilgileri paylaşabileceğini beyan eder. "
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
                    {!errors.email && (touched.email || show) && (
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
                  {cancelButton && (
                    <button
                      className="w-full border border-midgray hover:border-dark text-midgray hover:text-dark  rounded p-4 text-base transition duration-150 ease-out md:ease-in"
                      type="button"
                    >
                      Vazgeç
                    </button>
                  )}
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
          )}
        </Formik>
      )}
    </>
  );
};

export default CommentForm;
