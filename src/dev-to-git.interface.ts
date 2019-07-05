export interface ArticleConfig {
  id: string
  relativePathToArticle: string
}

// https://dev.to/api#available-json-parameters
export interface ArticleApi {
  body_markdown: string
}
