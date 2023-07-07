export interface ArticleFrontMatter {
  title: string;
  published: boolean;
}

export type Repository = {
  readonly username: string;
  readonly name: string;
};

export interface ArticleConfigFile {
  id: number;
  relativePathToArticle: string;
}

export interface MarkdownArticleConfig extends ArticleConfigFile {
  repository: Repository;
}
