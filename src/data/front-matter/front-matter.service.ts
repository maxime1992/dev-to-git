import { Injectable } from '@nestjs/common';
import extractFrontMatter from 'front-matter';

export interface FrontMatterResult<T> {
  readonly attributes: T;
}

@Injectable()
export abstract class FrontMatterServiceBase {
  abstract extractFrontMatter<T>(text: string): FrontMatterResult<T>;
}

@Injectable()
export class FrontMatterService implements FrontMatterServiceBase {
  public extractFrontMatter<T>(text: string): FrontMatterResult<T> {
    return extractFrontMatter<T>(text);
  }
}
