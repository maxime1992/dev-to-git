#!/usr/bin/env node

require('./dev-to-git.umd.js');

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
