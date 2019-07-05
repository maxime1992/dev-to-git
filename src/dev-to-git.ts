import minimist from 'minimist'
import fs from 'fs'
import dotenv from 'dotenv'
import { ArticleConfig, ArticleApi } from './dev-to-git.interface'
import { Article } from './article'

export const DEFAULT_CONFIG_PATH: string = './dev-to-git.json'

export class DevToGit {
  private configPath: string = DEFAULT_CONFIG_PATH
  private token: string = ''

  constructor() {
    dotenv.config()

    const { config } = minimist(process.argv.slice(2))

    if (config && typeof config === 'string') {
      this.configPath = config
    }

    if (!process.env.DEV_TO_GIT_TOKEN) {
      throw new Error('Token is required')
    }

    this.token = process.env.DEV_TO_GIT_TOKEN
  }

  public getConfigPath(): string {
    return this.configPath
  }

  public readConfigFile(): ArticleConfig[] {
    // @todo check structure of the object

    return JSON.parse(
      fs.readFileSync(this.getConfigPath()).toString()
    ) as ArticleConfig[]
  }

  public publishArticles() {
    const articles = this.readConfigFile()
    articles.forEach(articleConf => {
      const article = new Article(articleConf, this.token)
      article.publishArticle()
    })
  }
}

// @todo move to main file?
const devToGit = new DevToGit()
devToGit.publishArticles()
