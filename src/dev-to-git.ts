import chalk from 'chalk';
import { program } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import { Article } from './article';
import {
  ArticleConfig,
  ArticleConfigFile,
  ArticlePublishedStatus,
  ConfigurationOptions,
  Repository,
} from './dev-to-git.interface';
import { Logger, logBuilder } from './helpers';

export const DEFAULT_CONFIG_PATH: string = './dev-to-git.json';

const repositoryRe: RegExp = /.*\/(.*)\/(.*)\.git/;

export class DevToGit {
  private configuration: ConfigurationOptions;

  public logger: Logger;

  constructor() {
    dotenv.config();

    const pkg = JSON.parse(fs.readFileSync('package.json').toString());

    const prog = program
      .version(pkg.version)
      .arguments('[...files]')
      .option('--config <path>', `Pass custom path to .dev-to-git.json file`, DEFAULT_CONFIG_PATH)
      .option('--dev-to-token <token>', 'Token for publishing to dev.to', process.env.DEV_TO_TOKEN)
      .option('--repository-url <url>', 'Url of your repository you keep your articles in.')
      .option('--silent', `No console output`)
      .parse(process.argv);

    const opts = prog.opts();

    this.logger = logBuilder(opts.silent);

    if (!opts.devToToken) {
      this.logger('DEV_TO_TOKEN environment variable, or --dev-to-token argument is required');
      process.exit(1);
    }

    this.configuration = {
      silent: opts.silent,
      config: opts.config,
      devToToken: opts.devToToken,
      repository: this.parseRepository(opts.repository) || this.extractRepository(),
    };
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
        'If you do not specify --repository-url, you must have within your "package.json" a "repository" attribute which is an object and contains itself an attribute "url" like the following: https://github-gitlab-whatever.com/username/repository-name.git - this will be used to generate images links if necessary',
      );
      throw new Error();
    }
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

  public async publishArticles(): Promise<ArticlePublishedStatus[]> {
    const articles = this.readConfigFile();

    const articlePublishedStatuses = [];

    // instead of using Promise.all we use a for with await
    // to run the updates one by one to avoid hammering dev.to API
    // and have more risks of being rate limited
    for (const articleConf of articles) {
      const article = new Article(articleConf, this.configuration.devToToken);
      articlePublishedStatuses.push(await article.publishArticle());
    }

    return articlePublishedStatuses;
  }
}
