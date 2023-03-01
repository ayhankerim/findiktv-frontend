///api/revalidate?url=/haber/14/findik-bahceleri-yeni-sezona-hazirlaniyor-mu&secret=060680d30005ff8d4e4df5a39fc3b2a7914be
export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATION_SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" })
  }

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    await res.revalidate(req.query.url)
    return res.json({ revalidated: true, url: req.query.url })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send("Error revalidating")
  }
}
