import { ArticleConfig, ArticleApi } from './dev-to-git.interface';
import got from 'got';
import fs from 'fs';

export class Article {
  constructor(private articleConfig: ArticleConfig) {}

  public readArticleOnDisk(): string {
    return fs.readFileSync(this.articleConfig.relativePathToArticle).toString();
  }

  public publishArticle(token: string): got.GotPromise<any> {
    const body: ArticleApi = {
      body_markdown: this.readArticleOnDisk(),
    };

    return got(`https://dev.to/api/articles/${this.articleConfig.id}`, {
      json: true,
      method: 'PUT',
      headers: { 'api-key': token },
      body,
    });
  }
}
