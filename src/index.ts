#!/usr/bin/env node

import { DevToGit } from './dev-to-git';
import { UpdateStatus } from './dev-to-git.interface';
import { formatArticlePublishedStatuses } from './helpers';

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
    devToGit.logger(`An error occurred while publishing the articles`);
    console.error(error);
    process.exit(1);
  });
