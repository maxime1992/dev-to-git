import { Article } from './article';
import { Repository } from './dev-to-git.interface';

describe(`Article`, () => {
  let article: Article;
  const repository: Repository = { username: `maxime1992`, name: 'dev-to-git' };
  const relativePathToArticle = `./test/article.md`;

  beforeEach(() => {
    article = new Article({
      id: 0,
      relativePathToArticle,
      repository,
    });
  });

  describe(`Read`, () => {
    let articleRead: string;

    beforeEach(() => {
      articleRead = article.readArticleOnDisk();
    });

    it(`should read an article from the configuration`, () => {
      expect(articleRead).toContain(`This is my awesome article!`);
      expect(articleRead).toContain(`Hey, some text!`);
    });

    it(`should rewrite the local images URLs to match the raw file on github`, () => {
      expect(articleRead).toContain(
        `Image 1: ![alt text 1](https://raw.githubusercontent.com/${repository.username}/${repository.name}/master/test/image-1.png 'Title image 1')`,
      );

      expect(articleRead).toContain(
        `Image 2: ![alt text 2](https://raw.githubusercontent.com/${repository.username}/${repository.name}/master/test/image-2.png 'Title image 2')`,
      );

      expect(articleRead).toContain(
        `Image 3: ![alt text 3](https://raw.githubusercontent.com/${repository.username}/${repository.name}/master/test/image-3.png)`,
      );
    });
  });
});
