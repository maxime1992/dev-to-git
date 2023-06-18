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
