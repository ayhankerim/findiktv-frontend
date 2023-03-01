import ReactQuill, { Quill } from "react-quill"
import "react-quill/dist/quill.snow.css"

const editor = () => {
  //   const ReactQuill =
  //     typeof window === "object" ? require("react-quill") : () => false

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  }
  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
  ]
  return (
    <>
      <ReactQuill
        name="content"
        modules={modules}
        formats={formats}
        placeholder="Yorumunuz..."
        onChange={(value) => {
          setFieldValue("content", value)
          setFieldTouched("content", true)
          setIsShowing(true)
        }}
        //onChange={setValue}
        theme="snow"
      />
      {errors.content && (
        <>
          <style jsx global>{`
            .commentSection .commentId${commentId} .ql-toolbar.ql-snow,
            .commentSection .commentId${commentId} .ql-container.ql-snow {
              border-color: rgba(212, 17, 27, var(--tw-border-opacity));
            }
          `}</style>
          <p className="text-danger">{errors.content}</p>
        </>
      )}
    </>
  )
}

export default editor
