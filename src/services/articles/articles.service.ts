import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import {
  ArticleApiResponse,
  ArticleId,
} from '../../data/dev-to/articles/articles.interface';

@Injectable()
export class ArticlesService {
  private baseUrl = 'https://dev.to/api/articles';

  constructor(private httpService: HttpService) {}

  // dev.to API returns a maximum of 1000 articles but would by default return only 30
  // https://docs.dev.to/api/#tag/articles/paths/~1articles~1me~1all/get
  // instead of having to manage the pagination I think it's safe to assume people using
  // dev-to-git won't have more than 1000 articles for now
  public getArticles(): Observable<ArticleApiResponse[]> {
    return this.httpService
      .get<ArticleApiResponse[]>(`${this.baseUrl}/me/all?per_page=1000`)
      .pipe(map((x) => x.data));
  }

  public updateArticle(articleId: ArticleId, articleContent: string) {
    return this.httpService.put(`${this.baseUrl}/${articleId}`, articleContent);
  }
}
