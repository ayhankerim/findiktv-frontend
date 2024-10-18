import OneSignal from "react-onesignal"

export default async function runOneSignal() {
  if (!OneSignal.initialized) {
    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
    })
    OneSignal.showSlidedownPrompt()
  }
}
