import chalk from 'chalk';
import program from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import { Article } from './article';
import {
  ArticleConfig,
  ArticleConfigFile,
  ArticlePublishedStatus,
  ConfigurationOptions,
  Repository,
  UpdateStatus,
} from './dev-to-git.interface';
import { formatArticlePublishedStatuses, logBuilder, Logger } from './helpers';

export const DEFAULT_CONFIG_PATH: string = './dev-to-git.json';

const repositoryRe: RegExp = /.*\/(.*)\/(.*)\.git/;

export class DevToGit {
  private configuration: ConfigurationOptions;

  public logger: Logger;

  constructor() {
    dotenv.config();

    const pkg = require('../package.json');

    program
      .version(pkg.version)
      .arguments('[...files]')
      .option('--config <path>', `Pass custom path to .dev-to-git.json file`, DEFAULT_CONFIG_PATH)
      .option('--dev-to-token <token>', 'Token for publishing to dev.to', process.env.DEV_TO_GIT_TOKEN)
      .option('--repository-url <url>', 'Url of your repository you keep your articles in.')
      .option('--silent', `No console output`)
      .parse(process.argv);

    const configuration: ConfigurationOptions = (program as unknown) as ConfigurationOptions;
    this.configuration = configuration;

    this.logger = logBuilder(this.configuration);

    this.configuration.repository = this.parseRepository(program.repositoryUrl) || this.extractRepository();

    if (!this.configuration.devToToken) {
      this.logger(chalk.red('DEV_TO_GIT_TOKEN environment variable, or --dev-to-token argument is required'));
      process.exit(1);
    }
  }

  private parseRepository(repo: string | null): Repository | null {
    if (!repo) {
      return null;
    }

    const match = repo.match(repositoryRe);

    if (!match) {
      return null;
    }

    return {
      username: match[1],
      name: match[2],
    };
  }

  private extractRepository(): Repository {
    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json').toString());

      const repo = this.parseRepository(packageJson.repository.url);

      if (!repo) {
        throw Error();
      }

      return repo;
    } catch (error) {
      this.logger(
        chalk.red(
          'If you do not specify --repository-url, you must have within your "package.json" a "repository" attribute which is an object and contains itself an attribute "url" like the following: https://github-gitlab-whatever.com/username/repository-name.git - this will be used to generate images links if necessary',
        ),
      );
      process.exit(1);
    }
    throw new Error('Should not be reached');
  }

  public getConfigPath(): string {
    return this.configuration.config;
  }

  public readConfigFile(): ArticleConfig[] {
    // @todo check structure of the object

    const articleConfigFiles: ArticleConfigFile[] = JSON.parse(
      fs.readFileSync(this.getConfigPath()).toString(),
    ) as ArticleConfigFile[];

    return articleConfigFiles.map(articleConfigFile => ({
      ...articleConfigFile,
      repository: this.configuration.repository,
    }));
  }

  public publishArticles(): Promise<ArticlePublishedStatus[]> {
    const articles = this.readConfigFile();

    return Promise.all(
      articles.map(articleConf => {
        const article = new Article(articleConf);
        return article.publishArticle(this.configuration.devToToken);
      }),
    );
  }
}

// @todo move to main file?
const devToGit = new DevToGit();
devToGit
  .publishArticles()
  .then(articles => ({ articles, text: formatArticlePublishedStatuses(articles) }))
  .then(res => {
    devToGit.logger(res.text);

    res.articles.forEach(article => {
      if (
        article.updateStatus === UpdateStatus.ERROR ||
        article.updateStatus === UpdateStatus.FAILED_TO_EXTRACT_FRONT_MATTER
      ) {
        // if there's been at least one error, exit and fail
        process.exit(1);
      }
    });
  })
  .catch(error => {
    devToGit.logger(chalk.red(`An error occurred while publishing the articles`));
    console.error(error);
    process.exit(1);
  });
