import { Test, TestingModule } from '@nestjs/testing';
import { FrontMatterServiceBase } from '../front-matter/front-matter.service';
import { MarkdownService } from './markdown.service';

describe('MarkdownService', () => {
  let service: MarkdownService;

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
        MarkdownService,
      ],
    }).compile();

    service = module.get(MarkdownService);
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
});
