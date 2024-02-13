import React from "react"

const getEmbedUrl = (videoUrl) => {
  const youtubeRegex =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?v%3D)([\w-]{11}).*/
  const youtubeMatch = videoUrl.match(youtubeRegex)

  if (youtubeMatch && youtubeMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${youtubeMatch[2]}`
  }

  // Add support for other video platforms here

  return null
}

export default function VideoEmbed({ data }) {
  const embedUrl = getEmbedUrl(data)

  if (!embedUrl) return <div>Geçersiz video bağlantısı</div>

  return (
    <div className="video-embed relative pb-56.25 h-72 lg:h-[450px] overflow-hidden mt-5 md:mt-4 border-b border-secondary/20">
      <iframe
        title="video"
        src={embedUrl || ""}
        width={data.width || "100%"}
        height={data.height || "100%"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  )
}
