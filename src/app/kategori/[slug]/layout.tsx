import { fetchAPI } from "@/app/utils/fetch-api";
import { getStrapiMedia } from "@/app/utils/api-helpers";
import Banner from "@/app/components/Banner";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";

async function getGlobal(lang: string): Promise<any> {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  if (!token)
    throw new Error("The Strapi API Token environment variable is not set.");

  const path = `/global`;
  const options = { headers: { Authorization: `Bearer ${token}` } };

  const urlParamsObject = {
    populate: [
      "metadata.shareImage",
      "favicon",
      "notificationBanner.link",
      "navbar.links",
      "navbar.button",
      "navbar.logo",
      "footer.logo",
      "footer.button",
      "footer.columns",
      "footer.columns.links",
      "footer.smallText",
      "footer.copyright",
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

  const { notificationBanner, navbar, footer } = global.data.attributes;

  const navbarLogoUrl = getStrapiMedia(navbar.logo.data.attributes.url);

  const footerLogoUrl = getStrapiMedia(footer.logo.data.attributes.url);

  return (
    <div className="flex flex-col flex-grow justify-between min-h-screen">
      <div className="flex flex-col">
        <Navbar
          links={navbar.links}
          logoUrl={navbarLogoUrl}
          button={navbar.button}
        />
        <>{children}</>
        <Banner data={notificationBanner} />
      </div>
      <Footer
        logoUrl={footerLogoUrl}
        columns={footer.columns || []}
        smallText={footer.smallText || ""}
        copyright={footer.copyright || ""}
      />
    </div>
  );
}
