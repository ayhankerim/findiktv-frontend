const Layout = ({ children }) => {
  return (
    <div className="flex flex-col flex-grow justify-between min-h-screen bg-white">
      <div className="flex flex-col">
        <>{children}</>
      </div>
    </div>
  )
}

export default Layout
