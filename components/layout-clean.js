import { useState } from "react"

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col flex-grow justify-between min-h-screen">
      <div className="flex flex-col">
        <>{children}</>
      </div>
    </div>
  )
}

export default Layout
