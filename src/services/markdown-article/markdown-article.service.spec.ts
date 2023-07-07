import { Test, TestingModule } from '@nestjs/testing';
import { FrontMatterServiceBase } from '../front-matter/front-matter.interfaces';
import { MarkdownArticleService } from './markdown-article.service';

describe('MarkdownArticleService', () => {
  let service: MarkdownArticleService;

  let extractFrontMatterMock: jest.Mock;

  beforeEach(async () => {
    extractFrontMatterMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FrontMatterServiceBase,
          useFactory: (): FrontMatterServiceBase => ({
            extractFrontMatter: extractFrontMatterMock,
          }),
        },
        MarkdownArticleService,
      ],
    }).compile();

    service = module.get(MarkdownArticleService);
  });

  describe('extractDataFromFrontMatter', () => {
    it(`should extract front matter correctly when possible`, async () => {
      extractFrontMatterMock.mockReturnValueOnce({
        attributes: {
          title: 'Dev-to-git is used by Chuck Norris',
          published: true,
        },
      });

      const res = service.extractDataFromFrontMatter('mocked');

      expect(res).toEqual({
        published: true,
        title: 'Dev-to-git is used by Chuck Norris',
      });
    });

    it(`should consider that the article isn't published yet if there's no published attribute set to true explicitly`, async () => {
      extractFrontMatterMock.mockReturnValueOnce({
        attributes: {
          title: 'Dev-to-git is used by Chuck Norris',
          // note the absence of the published attribute in the response here
        },
      });

      const res = service.extractDataFromFrontMatter('mocked');

      expect(res).toEqual({
        published: false, // <-- note that published is considered false as there was no published attributes passed
        title: 'Dev-to-git is used by Chuck Norris',
      });
    });

    it(`should throw an error if the front matter isn't valid`, async () => {
      extractFrontMatterMock.mockReturnValueOnce({
        attributes: {
          // note that we don't have the bare minimum available: title property
        },
      });

      expect(() => service.extractDataFromFrontMatter('mocked')).toThrowError(
        `The article doesn't have a valid front matter`,
      );
    });
  });

  describe('updateLocalImageLinks', () => {
    it('should replace local image links', () => {
      const res = service.updateLocalImageLinks(
        `This is some text
Then we insert a picture here
![](./assets/pic1.jpg)
And while we're here, let's test all the other possibilities to define an image
![Some title here](./assets/pic2.jpg)
![Some title here](./assets/pic3.jpg 'And another title here for hover')
!['Some title here'](./assets/pic4.jpg 'And another title here for hover')`,
        {
          id: 1,
          relativePathToArticle: './src/some-article',
          repository: { username: 'maxime1992', name: 'dev-to-git' },
        },
      );

      expect(res).toBe(`This is some text
Then we insert a picture here
![](https://raw.githubusercontent.com/maxime1992/dev-to-git/master/src/some-article/assets/pic1.jpg)
And while we're here, let's test all the other possibilities to define an image
![Some title here](https://raw.githubusercontent.com/maxime1992/dev-to-git/master/src/some-article/assets/pic2.jpg)
![Some title here](https://raw.githubusercontent.com/maxime1992/dev-to-git/master/src/some-article/assets/pic3.jpg 'And another title here for hover')
!['Some title here'](https://raw.githubusercontent.com/maxime1992/dev-to-git/master/src/some-article/assets/pic4.jpg 'And another title here for hover')`);
    });

    it('should not replace image links that are not local', () => {
      const initialText = `This is some text
Then we insert a picture here but this time with an HTTP link directly that shouldn't be modified
![](https://test/assets/pic1.jpg)
And while we're here, let's test all the other possibilities to define an image
![Some title here](https://test/assets/pic2.jpg)
![Some title here](https://test/assets/pic3.jpg 'And another title here for hover')
!['Some title here'](https://test/assets/pic4.jpg 'And another title here for hover')`;

      const res = service.updateLocalImageLinks(initialText, {
        id: 1,
        relativePathToArticle: './src/some-article',
        repository: { username: 'maxime1992', name: 'dev-to-git' },
      });

      expect(res).toBe(initialText);
    });

    it('should be able to handle both local and non local images', () => {
      const res = service.updateLocalImageLinks(
        `This is some text
Then we insert a picture here but this time with an HTTP link directly that shouldn't be modified
![](https://test/assets/pic1.jpg)
And while we're here, let's test all the other possibilities to define an image
![Some title here](https://test/assets/pic2.jpg)
![Some title here](https://test/assets/pic3.jpg 'And another title here for hover')
!['Some title here'](https://test/assets/pic4.jpg 'And another title here for hover')
But it's also handling local links just fine:
![](./assets/pic1.jpg)`,
        {
          id: 1,
          relativePathToArticle: './src/some-article',
          repository: { username: 'maxime1992', name: 'dev-to-git' },
        },
      );

      expect(res).toBe(`This is some text
Then we insert a picture here but this time with an HTTP link directly that shouldn't be modified
![](https://test/assets/pic1.jpg)
And while we're here, let's test all the other possibilities to define an image
![Some title here](https://test/assets/pic2.jpg)
![Some title here](https://test/assets/pic3.jpg 'And another title here for hover')
!['Some title here'](https://test/assets/pic4.jpg 'And another title here for hover')
But it's also handling local links just fine:
![](https://raw.githubusercontent.com/maxime1992/dev-to-git/master/src/some-article/assets/pic1.jpg)`);
    });
  });
});
