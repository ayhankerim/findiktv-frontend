import { fetchAPI } from "@/app/utils/fetch-api";
import Post from "@/app/views/post";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

async function getPostBySlug(id: number, slug: string) {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/articles`;
  const urlParamsObject = {
    filters: {
      id: {
        $eq: id,
      },
      slug: {
        $eq: slug,
      },
    },
    populate: {
      image: { fields: ["url", "alternativeText"] },
      homepage_image: { fields: ["url"] },
      category: { fields: ["title", "slug"] },
      tags: { fields: ["id", "title", "slug"] },
      cities: { fields: ["id", "title", "slug"] },
      view: { fields: ["id", "view"] },
      comments: {
        filters: {
          $or: [
            {
              approvalStatus: {
                $eq: "approved",
              },
            },
            {
              approvalStatus: {
                $eq: "ignored",
              },
            },
          ],
          removed: {
            $eq: false,
          },
          thread_of: {
            id: {
              $null: true,
            },
          },
          reply_to: {
            id: {
              $null: true,
            },
          },
          user: {
            id: {
              $notNull: true,
            },
          },
        },
        fields: [
          "blockedThread",
          "content",
          "createdAt",
          "dislike",
          "like",
          "flag",
          "approvalStatus",
        ],
        populate: {
          user: {
            fields: [
              "about",
              "name",
              "surname",
              "username",
              "blocked",
              "confirmed",
            ],
            populate: {
              avatar: {
                populate: "*",
              },
              SystemAvatar: {
                populate: {
                  image: {
                    populate: "*",
                  },
                },
                fields: ["*"],
              },
              city: {
                populate: ["title"],
              },
              role: {
                populate: ["name"],
              },
            },
          },
          thread_ons: {
            field: ["id"],
            populate: {
              user: {
                fields: [
                  "about",
                  "name",
                  "surname",
                  "username",
                  "blocked",
                  "confirmed",
                ],
                populate: {
                  avatar: {
                    populate: "*",
                  },
                  SystemAvatar: {
                    populate: {
                      image: {
                        populate: "*",
                      },
                    },
                    fields: ["*"],
                  },
                  city: {
                    populate: ["title"],
                  },
                  role: {
                    populate: ["name"],
                  },
                },
              },
            },
          },
          reply_froms: {
            field: ["id"],
            populate: {
              user: {
                fields: [
                  "about",
                  "name",
                  "surname",
                  "username",
                  "blocked",
                  "confirmed",
                ],
                populate: {
                  avatar: {
                    populate: "*",
                  },
                  SystemAvatar: {
                    populate: {
                      image: {
                        populate: "*",
                      },
                    },
                    fields: ["*"],
                  },
                  city: {
                    populate: ["title"],
                  },
                  role: {
                    populate: ["name"],
                  },
                },
              },
            },
          },
        },
        sort: ["id:desc"],
        pagination: {
          start: 0,
          limit: 25,
        },
      },
      reactions: {
        fields: ["Value"],
        populate: {
          ReactionType: { fields: ["slug"] },
        },
      },
      contentSections: {
        populate: {
          __component: "*",
          files: "*",
          file: "*",
          url: "*",
          body: "*",
          content: "*",
          title: "*",
        },
      },
    },
  };
  const options = { headers: { Authorization: `Bearer ${token}` } };
  const response = await fetchAPI(path, urlParamsObject, options);
  return response;
}

async function getMetaData(slug: string) {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/articles`;
  const urlParamsObject = {
    filters: { slug },
    fields: ["title", "summary"],
    populate: {
      homepage_image: { populate: "*" },
    },
  };
  const options = { headers: { Authorization: `Bearer ${token}` } };
  const response = await fetchAPI(path, urlParamsObject, options);
  return response.data;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const meta = await getMetaData(params.slug);
  const metadata = meta[0]?.attributes || [];

  return {
    title: metadata.title || "",
    description: metadata.summary || "",
  };
}

export default async function PostRoute({
  params,
}: {
  params: { id: number; slug: string };
}) {
  const { slug, id } = params;
  const data = await getPostBySlug(id, slug);
  if (data.data.length === 0) return notFound();
  return <Post data={data.data[0]} />;
}

export async function generateStaticParams() {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const path = `/articles`;
  const options = { headers: { Authorization: `Bearer ${token}` } };
  const articleResponse = await fetchAPI(
    path,
    {
      fields: ["slug", "id"],
    },
    options
  );
  return articleResponse.data.map(
    (article: {
      id: number;
      attributes: {
        slug: string;
      };
    }) => ({ id: article.id.toString(), slug: article.attributes.slug })
  );
}
