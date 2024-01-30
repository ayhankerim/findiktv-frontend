import { createAutoArticle } from "utils/api-add-auto-article"
export default async function handler(req, res) {
  const createAutoArticleData = await createAutoArticle()
  if (req.query.secret !== process.env.REVALIDATION_SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" })
  }
  res.status(200).json(createAutoArticleData)
}
