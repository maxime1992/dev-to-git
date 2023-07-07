import { Injectable } from '@nestjs/common';
import { FrontMatterServiceBase } from '../front-matter/front-matter.interfaces';
import {
  ArticleFrontMatter,
  MarkdownArticleConfig,
} from './markdown-article.interfaces';

interface ImageToReplace {
  localImage: string;
  remoteImage: string;
}

const imagesRe = /\!\[.*\]\(\.\/.*\)/g;
const imageRe = /\!\[(.*)\]\(([^ \)]*)(?: '(.*)')?\)/;

const excludeArticleFromPath = (path: string): string =>
  path.replace(/\/[^\/]+\.md$/, '');

@Injectable()
export class MarkdownArticleService {
  constructor(private frontMatterService: FrontMatterServiceBase) {}

  public extractDataFromFrontMatter(text: string): ArticleFrontMatter {
    const frontMatter =
      this.frontMatterService.extractFrontMatter<ArticleFrontMatter>(text);

    if (
      !frontMatter ||
      !frontMatter.attributes ||
      !frontMatter.attributes.title
    ) {
      throw new Error(`The article doesn't have a valid front matter`);
    }

    return {
      title: frontMatter.attributes.title,
      published: frontMatter.attributes.published || false,
    };
  }

  public updateLocalImageLinks(
    text: string,
    articleConfig: MarkdownArticleConfig,
  ): string {
    let searchImageResult;
    const localImagesToReplace: ImageToReplace[] = [];

    // tslint:disable-next-line: no-conditional-assignment
    while ((searchImageResult = imagesRe.exec(text))) {
      const [image] = searchImageResult;

      const [_, alt = null, path, title = null] = imageRe.exec(image) || [
        null,
        null,
        null,
        null,
      ];

      if (path) {
        const basePath: string = excludeArticleFromPath(
          articleConfig.relativePathToArticle.substr(2),
        );
        const assetPath = path.substr(2);

        localImagesToReplace.push({
          localImage: image,
          remoteImage: `![${alt || ''}](https://raw.githubusercontent.com/${
            articleConfig.repository.username
          }\/${articleConfig.repository.name}/master/${basePath}/${assetPath}${
            title ? ` '${title}'` : ``
          })`,
        });
      }
    }

    return localImagesToReplace.reduce(
      (articleTemp, imageToReplace) =>
        articleTemp.replace(
          imageToReplace.localImage,
          imageToReplace.remoteImage,
        ),
      text,
    );
  }
}
