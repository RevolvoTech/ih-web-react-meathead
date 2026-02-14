import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meatheadpakistan.vercel.app'
  const staticDate = new Date('2026-02-14T00:00:00.000Z')

  return [
    {
      url: baseUrl,
      lastModified: staticDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/beef-patties-islamabad`,
      lastModified: staticDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/beef-patties-rawalpindi`,
      lastModified: staticDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}
