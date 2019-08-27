import { ArticlePublishedStatus, ConfigurationOptions, UpdateStatus } from './dev-to-git.interface';

export const formatArticlePublishedStatuses = (articlePublishedStatuses: ArticlePublishedStatus[]): string => {
  return articlePublishedStatuses
    .map(articleStatus => {
      if (articleStatus.updateStatus === UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER) {
        return `Article with ID "${articleStatus.articleId}" doesn't have a front matter correctly formatted`;
      }

      let text: string = `Article "${articleStatus.articleTitle}" `;

      switch (articleStatus.updateStatus) {
        case UpdateStatus.ALREADY_UP_TO_DATE as UpdateStatus.ALREADY_UP_TO_DATE:
          text += `is already up to date`;
          break;
        case UpdateStatus.ERROR as UpdateStatus.ERROR:
          text +=
            `encountered an error:\n` +
            `Error name: "${articleStatus.error.name}"\n` +
            `Error message: "${articleStatus.error.message}"\n` +
            `Error stack: "${articleStatus.error.stack}"`;
          break;
        case UpdateStatus.UPDATED as UpdateStatus.UPDATED:
          text += `has been successfully updated`;
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
