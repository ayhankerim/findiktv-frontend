import { fetchAPI } from "@/utils/fetch-api";
import { getStrapiMedia } from "@/utils/api-helpers";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

async function getGlobal(lang: string): Promise<any> {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  if (!token)
    throw new Error("The Strapi API Token environment variable is not set.");

  const path = `/global`;
  const options = { headers: { Authorization: `Bearer ${token}` } };

  const urlParamsObject = {
    populate: [
      "metadata",
      "metadata.shareImage",
      "favicon",
      "notificationBanner",
      "navbar",
      "navbar.links",
      "navbar.button",
      "navbar.logo",
      "footer",
      "footer.logo",
      "footer.columns",
      "footer.columns.links",
    ],
    locale: lang,
  };
  return await fetchAPI(path, urlParamsObject, options);
}
export default async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const global = await getGlobal("tr");
  // TODO: CREATE A CUSTOM ERROR PAGE
  if (!global.data) return null;

  const { notificationBanner, navbar, footer } = global.data;

  const navbarLogoUrl = getStrapiMedia(navbar.logo.url);

  const footerLogoUrl = getStrapiMedia(footer.logo.url);

  return (
    <div className="flex flex-col flex-grow justify-between min-h-screen">
      <div className="flex flex-col">
        {/* <Navbar
          links={navbar.links}
          logoUrl={navbarLogoUrl}
          button={navbar.button}
        /> */}
        <>{children}</>
        <Banner data={notificationBanner} />
      </div>
      {/* <Footer
        logoUrl={footerLogoUrl}
        columns={footer.columns || []}
        smallText={footer.smallText || ""}
        copyright={footer.copyright || ""}
      /> */}
    </div>
  );
}
