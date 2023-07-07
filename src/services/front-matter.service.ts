import { Injectable } from '@nestjs/common';
import extractFrontMatter from 'front-matter';
import {
  FrontMatterResult,
  FrontMatterServiceBase,
} from './front-matter.interfaces';

@Injectable()
export class FrontMatterService implements FrontMatterServiceBase {
  public extractFrontMatter<T>(text: string): FrontMatterResult<T> {
    return extractFrontMatter<T>(text);
  }
}
