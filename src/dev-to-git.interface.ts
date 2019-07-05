export interface ArticleConfig {
  title: string
  description: string
  id: string
  published: string
  urlToMainImage: string
  tags: string[]
  relativePathToArticle: string
  series: string
  publishUnderOrg: boolean
  canonicalUrl: string
}

// https://dev.to/api#available-json-parameters
export interface ArticleApi {
  title: string
  description: string
  body_markdown: string
  published: string
  tags: string[]
  series: string
  publish_under_org: boolean
  main_image?: string
  canonical_url?: string
}
