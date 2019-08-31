import { ArticlePublishedStatus, ConfigurationOptions, UpdateStatus } from './dev-to-git.interface';
import chalk from 'chalk';

export const formatArticlePublishedStatuses = (articlePublishedStatuses: ArticlePublishedStatus[]): string => {
  return articlePublishedStatuses
    .map(articleStatus => {
      if (articleStatus.updateStatus === UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER) {
        return chalk.red(
          `Article with ID "${articleStatus.articleId}" doesn't have a front matter correctly formatted`,
        );
      }

      const baseText: string = `[${articleStatus.published ? 'PUBLISHED' : 'DRAFT'}] Article "${
        articleStatus.articleTitle
      }" `;
      let text: string = '';

      switch (articleStatus.updateStatus) {
        case UpdateStatus.ALREADY_UP_TO_DATE as UpdateStatus.ALREADY_UP_TO_DATE:
          text = chalk.blueBright(baseText + `is already up to date`);
          break;
        case UpdateStatus.ERROR as UpdateStatus.ERROR:
          text = chalk.redBright(
            baseText +
              `encountered an error:\n` +
              `Error name: "${articleStatus.error.name}"\n` +
              `Error message: "${articleStatus.error.message}"\n` +
              `Error stack: "${articleStatus.error.stack}"`,
          );
          break;
        case UpdateStatus.UPDATED as UpdateStatus.UPDATED:
          if (articleStatus.published) {
            text = chalk.greenBright(baseText + `has been successfully updated`);
          } else {
            text = chalk.yellowBright(baseText + `has been successfully updated`);
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

export const logBuilder = (options: ConfigurationOptions): Logger => (...messages: string[]) => {
  if (!options.silent) {
    console.log(...messages);
  }
};
