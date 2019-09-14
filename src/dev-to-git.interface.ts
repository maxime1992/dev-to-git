export type Repository = {
  readonly username: string;
  readonly name: string;
};

export interface ArticleConfigFile {
  id: number;
  relativePathToArticle: string;
}

export interface ArticleConfig extends ArticleConfigFile {
  repository: Repository;
}

// https://dev.to/api#available-json-parameters
export interface ArticleApi {
  body_markdown: string;
}

export interface ArticleApiResponse {
  id: number;
  body_markdown: string;
}

export enum UpdateStatus {
  UPDATED = 'Updated',
  ALREADY_UP_TO_DATE = 'AlreadyUpToDate',
  ERROR = 'Error',
  FAILED_TO_EXTRACT_FRONT_MATTER = 'FailedToExtractFrontMatter',
}

export interface ConfigurationOptions {
  silent: boolean;
  config: string; // the config file path
  devToToken: string;
  repository: Repository;
}

export type ArticlePublishedStatus = {
  articleId: number;
} & (
  | {
      updateStatus: UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER;
    }
  | ({ articleTitle: string; published: boolean } & (
      | {
          updateStatus: Exclude<UpdateStatus, UpdateStatus.ERROR | UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER>;
        }
      | {
          updateStatus: UpdateStatus.ERROR;
          error: Error;
        }
    )));
