import { Injectable } from '@nestjs/common';

export interface FrontMatterResult<T> {
  readonly attributes: T;
}

@Injectable()
export abstract class FrontMatterServiceBase {
  abstract extractFrontMatter<T>(text: string): FrontMatterResult<T>;
}
