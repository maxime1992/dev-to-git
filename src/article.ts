import { ArticleConfig, ArticleApi, ArticlePublishedStatus, UpdateStatus } from './dev-to-git.interface';
import got from 'got';
import fs from 'fs';
import extractFrontMatter from 'front-matter';

interface ArticleFrontMatter {
  title: string;
}

const imagesRe: RegExp = /\!\[.*\]\(\.\/.*\)/g;
const imageRe: RegExp = /\!\[(.*)\]\(([^ \)]*)(?: '(.*)')?\)/;

const excludeArticleFromPath = (path: string): string => path.replace(/\/[^\/]+\.md$/, '');

interface ImageToReplace {
  localImage: string;
  remoteImage: string;
}

export class Article {
  constructor(private articleConfig: ArticleConfig) {}

  private updateLocalImageLinks(article: string): string {
    let searchImageResult,
      localImagesToReplace: ImageToReplace[] = [];

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

  public publishArticle(token: string): Promise<ArticlePublishedStatus> {
    const body: ArticleApi = {
      body_markdown: this.readArticleOnDisk(),
    };

    let frontMatter: ArticleFrontMatter;

    try {
      frontMatter = this.extractDataFromFrontMatter(body.body_markdown);
    } catch {
      return Promise.resolve({
        articleId: this.articleConfig.id,
        updateStatus: UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER as UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER,
      });
    }

    return got(`https://dev.to/api/articles/${this.articleConfig.id}`, {
      json: true,
      method: 'PUT',
      headers: { 'api-key': token },
      body,
    })
      .then(() => ({
        articleId: this.articleConfig.id,
        articleTitle: frontMatter.title,
        updateStatus: UpdateStatus.UPDATED as UpdateStatus.UPDATED,
      }))
      .catch(() => ({
        articleId: this.articleConfig.id,
        articleTitle: frontMatter.title,
        updateStatus: UpdateStatus.ERROR as UpdateStatus.ERROR,
      }));
  }

  private extractDataFromFrontMatter(textArticle: string): ArticleFrontMatter {
    const frontMatter = extractFrontMatter<ArticleFrontMatter>(textArticle);

    if (!frontMatter || !frontMatter.attributes || !frontMatter.attributes.title) {
      throw new Error(`The article doesn't have a valid front matter`);
    }

    return { title: frontMatter.attributes.title };
  }
}
