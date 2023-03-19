import OneSignal from "react-onesignal"

export default async function runOneSignal() {
  await OneSignal.init({
    appId: "46b70e76-d4f7-40ac-a1e4-5b43678fe4f3",
    allowLocalhostAsSecureOrigin: true,
  })
  OneSignal.showSlidedownPrompt()
}
