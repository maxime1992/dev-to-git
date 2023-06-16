import chalk from 'chalk';
import { ArticlePublishedStatus, UpdateStatus } from './dev-to-git.interface';

export const formatArticlePublishedStatuses = (articlePublishedStatuses: ArticlePublishedStatus[]): string => {
  return articlePublishedStatuses
    .map(articleStatus => {
      if (articleStatus.updateStatus === UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER) {
        return `Article with ID "${articleStatus.articleId}" doesn't have a front matter correctly formatted`;
      }

      const baseText: string = `[${articleStatus.published ? 'PUBLISHED' : 'DRAFT'}] Article "${
        articleStatus.articleTitle
      }" `;
      let text: string = '';

      switch (articleStatus.updateStatus) {
        case UpdateStatus.ALREADY_UP_TO_DATE as UpdateStatus.ALREADY_UP_TO_DATE:
          text = baseText + `is already up to date`;
          break;
        case UpdateStatus.ERROR as UpdateStatus.ERROR:
          text =
            baseText +
            `encountered an error:\n` +
            `Error name: "${articleStatus.error.name}"\n` +
            `Error message: "${articleStatus.error.message}"\n` +
            `Error stack: "${articleStatus.error.stack}"`;
          break;
        case UpdateStatus.UPDATED as UpdateStatus.UPDATED:
          if (articleStatus.published) {
            text = baseText + `has been successfully updated`;
          } else {
            text = baseText + `has been successfully updated`;
          }
          break;

        default:
          throw new UnreachabelCase(articleStatus);
      }

      return text;
    })
    .join(`\n`);
};

class UnreachabelCase {
  // tslint:disable-next-line:no-empty
  constructor(payload: never) {}
}

export type Logger = (...messages: string[]) => void;

export const logBuilder = (silent: boolean): Logger => (...messages: string[]) => {
  if (!silent) {
    console.log(...messages);
  }
};
