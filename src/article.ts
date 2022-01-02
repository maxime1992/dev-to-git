import {
  ArticleConfig,
  ArticleApi,
  ArticlePublishedStatus,
  UpdateStatus,
  ArticleApiResponse,
} from './dev-to-git.interface';
import got from 'got';
import fs from 'fs';
import extractFrontMatter from 'front-matter';

interface ArticleFrontMatter {
  title: string;
  published: boolean;
}

const imagesRe: RegExp = /\!\[.*\]\(\.\/.*\)/g;
const imageRe: RegExp = /\!\[(.*)\]\(([^ \)]*)(?: '(.*)')?\)/;

const excludeArticleFromPath = (path: string): string => path.replace(/\/[^\/]+\.md$/, '');

interface ImageToReplace {
  localImage: string;
  remoteImage: string;
}

export class Article {
  // dev.to API returns a maximum of 1000 articles but would by default return only 30
  // https://docs.dev.to/api/#tag/articles/paths/~1articles~1me~1all/get
  // instead of having to manage the pagination I think it's safe to assume people using
  // dev-to-git won't have more than 1000 articles for now
  // also note that we're using a property instead of a method here so that the result is
  // shared/reused for all the different articles with only 1 HTTP call
  private articles: Promise<Record<number, string>> = got(`https://dev.to/api/articles/me/all?per_page=1000`, {
    json: true,
    method: 'GET',
    headers: { 'api-key': this.token },
  }).then((res: got.Response<ArticleApiResponse[]>) =>
    res.body.reduce<Record<number, string>>((articlesMap, article) => {
      articlesMap[article.id] = article.body_markdown;
      return articlesMap;
    }, {}),
  );

  constructor(private articleConfig: ArticleConfig, private token: string) {}

  private updateLocalImageLinks(article: string): string {
    let searchImageResult;
    let localImagesToReplace: ImageToReplace[] = [];

    // tslint:disable-next-line: no-conditional-assignment
    while ((searchImageResult = imagesRe.exec(article))) {
      const [image] = searchImageResult;

      const [_, alt = null, path, title = null] = imageRe.exec(image) || [null, null, null, null];

      if (path) {
        const basePath: string = excludeArticleFromPath(this.articleConfig.relativePathToArticle.substr(2));
        const assetPath = path.substr(2);

        localImagesToReplace.push({
          localImage: image,
          remoteImage: `![${alt || ''}](https://raw.githubusercontent.com/${this.articleConfig.repository.username}\/${
            this.articleConfig.repository.name
          }/master/${basePath}/${assetPath}${title ? ` '${title}'` : ``})`,
        });
      }
    }

    return localImagesToReplace.reduce(
      (articleTemp, imageToReplace) => articleTemp.replace(imageToReplace.localImage, imageToReplace.remoteImage),
      article,
    );
  }

  public readArticleOnDisk(): string {
    const article = fs.readFileSync(this.articleConfig.relativePathToArticle).toString();
    return this.updateLocalImageLinks(article);
  }

  public async publishArticle(): Promise<ArticlePublishedStatus> {
    const body: ArticleApi = {
      article: { body_markdown: this.readArticleOnDisk() },
    };

    let frontMatter: ArticleFrontMatter;

    try {
      frontMatter = this.extractDataFromFrontMatter(body.article.body_markdown);
    } catch {
      return Promise.resolve({
        articleId: this.articleConfig.id,
        updateStatus: UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER as UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER,
      });
    }

    let remoteArticleBodyMarkdown: string | null;

    try {
      const articles: Record<number, string> = await this.articles;
      remoteArticleBodyMarkdown = articles[this.articleConfig.id];

      if (remoteArticleBodyMarkdown === null) {
        throw new Error(`Remote article body with id ${this.articleConfig.id} has not been found`);
      }
    } catch (error) {
      return {
        updateStatus: UpdateStatus.ERROR as UpdateStatus.ERROR,
        articleId: this.articleConfig.id,
        articleTitle: frontMatter.title,
        error,
        published: frontMatter.published,
      };
    }

    if (remoteArticleBodyMarkdown && remoteArticleBodyMarkdown.trim() === body.article.body_markdown.trim()) {
      return {
        articleId: this.articleConfig.id,
        updateStatus: UpdateStatus.ALREADY_UP_TO_DATE as UpdateStatus.ALREADY_UP_TO_DATE,
        articleTitle: frontMatter.title,
        published: frontMatter.published,
      };
    }

    return got(`https://dev.to/api/articles/${this.articleConfig.id}`, {
      json: true,
      method: 'PUT',
      headers: { 'api-key': this.token },
      body,
    })
      .then(() => ({
        articleId: this.articleConfig.id,
        articleTitle: frontMatter.title,
        updateStatus: UpdateStatus.UPDATED as UpdateStatus.UPDATED,
        published: frontMatter.published,
      }))
      .catch(error => ({
        articleId: this.articleConfig.id,
        articleTitle: frontMatter.title,
        updateStatus: UpdateStatus.ERROR as UpdateStatus.ERROR,
        error,
        published: frontMatter.published,
      }));
  }

  private extractDataFromFrontMatter(textArticle: string): ArticleFrontMatter {
    const frontMatter = extractFrontMatter<ArticleFrontMatter>(textArticle);

    if (!frontMatter || !frontMatter.attributes || !frontMatter.attributes.title) {
      throw new Error(`The article doesn't have a valid front matter`);
    }

    return { title: frontMatter.attributes.title, published: frontMatter.attributes.published || false };
  }
}
