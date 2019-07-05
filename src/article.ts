import { ArticleConfig, ArticleApi } from './dev-to-git.interface'
import got from 'got'
import fs from 'fs'

export class Article {
  constructor(private articleConfig: ArticleConfig, private token: string) {}

  public readArticleOnDisk(): string {
    return fs.readFileSync(this.articleConfig.relativePathToArticle).toString()
  }

  public publishArticle(): got.GotPromise<any> {
    const body: ArticleApi = {
      title: this.articleConfig.title,
      description: this.articleConfig.description,
      body_markdown: this.readArticleOnDisk(),
      published: this.articleConfig.published,
      tags: this.articleConfig.tags,
      series: this.articleConfig.series,
      publish_under_org: this.articleConfig.publishUnderOrg,
      main_image: this.articleConfig.urlToMainImage,
      canonical_url: this.articleConfig.canonicalUrl
    }

    return got(`https://dev.to/api/articles/${this.articleConfig.id}`, {
      json: true,
      method: 'PUT',
      headers: { 'api-key': this.token },
      body
    })
  }
}
