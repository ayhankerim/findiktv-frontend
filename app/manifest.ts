import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FINDIK TV',
    short_name: 'FINDIK TV',
    description: 'FINDIK TV, fındık sektörü başta olmak üzere Türk Tarım Ekonomisi odaklı haber ve yayınlar yapan dijital bir platformdur.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#004aad',
    icons: [
      {
        src: process.env.MANIFEST_ICON || "",
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}