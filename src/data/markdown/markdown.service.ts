import { Injectable } from '@nestjs/common';
import { FrontMatterServiceBase } from '../front-matter/front-matter.service';
import { ArticleFrontMatter } from './types';

@Injectable()
export class MarkdownService {
  constructor(private frontMatterService: FrontMatterServiceBase) {}

  public extractDataFromFrontMatter(text: string): ArticleFrontMatter {
    const frontMatter =
      this.frontMatterService.extractFrontMatter<ArticleFrontMatter>(text);

    if (
      !frontMatter ||
      !frontMatter.attributes ||
      !frontMatter.attributes.title
    ) {
      throw new Error(`The article doesn't have a valid front matter`);
    }

    return {
      title: frontMatter.attributes.title,
      published: frontMatter.attributes.published || false,
    };
  }
}
