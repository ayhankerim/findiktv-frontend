import React, { useEffect } from "react"
import ErrorPage from "next/error"

const CommentArticle = ({}) => {
  return (
    <>
      <main className="container flex flex-row items-start justify-between gap-2 pt-2 bg-white">
        <div className="flex-1">
          <section className="commentSection">YORUMLAR</section>
        </div>
        <aside className="flex-none w-[336px]">01</aside>
      </main>
    </>
  )
}

export default CommentArticle
