import minimist from 'minimist';
import fs from 'fs';
import dotenv from 'dotenv';
import { ArticleConfig, ArticleConfigFile, Repository, ArticlePublishedStatus } from './dev-to-git.interface';
import { Article } from './article';
import { formatArticlePublishedStatuses } from './helpers';

export const DEFAULT_CONFIG_PATH: string = './dev-to-git.json';

const repositoryRe: RegExp = /.*\/(.*)\/(.*)\.git/;

export class DevToGit {
  private configPath: string = DEFAULT_CONFIG_PATH;
  private token: string = '';
  private repository: Repository = { username: '', name: '' };

  constructor() {
    dotenv.config();

    const { config } = minimist(process.argv.slice(2));

    if (config && typeof config === 'string') {
      this.configPath = config;
    }

    this.extractRepository();

    if (!process.env.DEV_TO_GIT_TOKEN) {
      throw new Error('Token is required');
    }

    this.token = process.env.DEV_TO_GIT_TOKEN;
  }

  private extractRepository(): void {
    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json').toString());

      const matchRepositoryUrl = (packageJson.repository.url as string).match(repositoryRe);

      if (matchRepositoryUrl) {
        const [_, username, name] = matchRepositoryUrl;
        this.repository = { username, name };
      } else {
        throw new Error();
      }
    } catch (error) {
      throw new Error(
        'You must have within your "package.json" a "repository" attribute which is an object and contains itself an attribute "url" like the following: https://github-gitlab-whatever.com/username/repository-name.git - this will be used to generate images links if necessary',
      );
    }
  }

  public getConfigPath(): string {
    return this.configPath;
  }

  public readConfigFile(): ArticleConfig[] {
    // @todo check structure of the object

    const articleConfigFiles: ArticleConfigFile[] = JSON.parse(
      fs.readFileSync(this.getConfigPath()).toString(),
    ) as ArticleConfigFile[];

    return articleConfigFiles.map(articleConfigFile => ({
      ...articleConfigFile,
      repository: this.repository,
    }));
  }

  public publishArticles(): Promise<ArticlePublishedStatus[]> {
    const articles = this.readConfigFile();

    return Promise.all(
      articles.map(articleConf => {
        const article = new Article(articleConf);
        return article.publishArticle(this.token);
      }),
    );
  }
}

// @todo move to main file?
const devToGit = new DevToGit();
devToGit
  .publishArticles()
  .then(formatArticlePublishedStatuses)
  .then(console.log)
  .catch(() => {
    throw new Error(`An error occured while publishing the articles`);
  });
