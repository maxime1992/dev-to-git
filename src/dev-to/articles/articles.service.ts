import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ArticleApiResponse, ArticleId } from './articles.interface';

@Injectable()
export class ArticlesService {
  private baseUrl = 'https://dev.to/api/articles';

  constructor(private httpService: HttpService) {}

  public getArticles(): Observable<ArticleApiResponse[]> {
    return this.httpService
      .get<ArticleApiResponse[]>(`${this.baseUrl}/me/all?per_page=1000`)
      .pipe(map(x => x.data));
  }

  public updateArticle(articleId: ArticleId, articleContent: string) {
    return this.httpService.put(`${this.baseUrl}/${articleId}`, articleContent);
  }
}
