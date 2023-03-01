import { useState } from "react"
import Navbar from "./elements/navbar"
import Footer from "./elements/footer"
import NotificationBanner from "./elements/notification-banner"

const Layout = ({ children, global, pageContext }) => {
  const { navbar, footer, notificationBanner } = global.attributes

  const [bannerIsShown, setBannerIsShown] = useState(true)
  return (
    <div className="flex flex-col flex-grow justify-between min-h-screen">
      {/* Aligned to the top */}
      <div className="flex flex-col">
        {notificationBanner && bannerIsShown && (
          <NotificationBanner
            data={notificationBanner}
            closeSelf={() => setBannerIsShown(false)}
          />
        )}
        <Navbar navbar={navbar} pageContext={pageContext} />
        <>{children}</>
      </div>
      {/* Aligned to the bottom */}
      <Footer footer={footer} />
    </div>
  )
}

export default Layout
