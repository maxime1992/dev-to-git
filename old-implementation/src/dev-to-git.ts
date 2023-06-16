import { Command, OptionValues, program } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import { Article } from './article';
import {
  ArticleApiResponse,
  ArticleConfig,
  ArticleConfigFile,
  ArticlePublishedStatus,
  ConfigurationOptions,
  Repository,
  UpdateStatus,
} from './dev-to-git.interface';
import { Logger, formatArticlePublishedStatuses, logBuilder, readPackageJson } from './helpers';

export const DEFAULT_CONFIG_PATH: string = './dev-to-git.json';

const repositoryRe: RegExp = /.*\/(.*)\/(.*)\.git/;

export class DevToGit {
  private configuration: ConfigurationOptions;

  public logger: Logger;

  private pkg = readPackageJson();

  constructor() {
    dotenv.config();

    const handleCommon = (opts: OptionValues) => {
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
    };

    const prog = program.version(this.pkg.version);

    const sharedOptions = (command: Command) =>
      command
        .option('--config <path>', `Pass custom path to .dev-to-git.json file`, DEFAULT_CONFIG_PATH)
        .option('--dev-to-token <token>', 'Token for publishing to dev.to', process.env.DEV_TO_TOKEN)
        .option('--repository-url <url>', 'Url of your repository you keep your articles in.')
        .option('--silent', `No console output`);

    const publishCommand = prog.command('publish');
    const retrieveCommand = prog.command('retrieve');

    sharedOptions(publishCommand).action(() => {
      const opts = publishCommand.opts();

      handleCommon(opts);

      this.publishArticles()
        .then(articles => ({ articles, text: formatArticlePublishedStatuses(articles) }))
        .then(res => {
          this.logger(res.text);

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
          this.logger(`An error occurred while publishing the articles`);
          console.error(error);
          process.exit(1);
        });
    });

    sharedOptions(retrieveCommand).action(async () => {
      const opts = retrieveCommand.opts();
      handleCommon(opts);

      const getArticles = async (): Promise<Record<number, string>> => {
        return fetch('https://dev.to/api/articles/me/all?per_page=1000', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.configuration.devToToken,
          },
        })
          .then(res => res.json())
          .then((res: ArticleApiResponse[]) =>
            res.reduce<Record<number, string>>((articlesMap, article) => {
              articlesMap[article.id] = article.body_markdown;
              return articlesMap;
            }, {}),
          );
      };

      const articles = await getArticles();

      for (const article of Object.entries(articles)) {
        fs.writeFileSync(`./blog-posts/${article[0]}.md`, article[1]);
      }
    });

    prog.parse(process.argv);
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
      const repo = this.parseRepository(this.pkg.repository.url);

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
