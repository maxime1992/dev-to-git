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
