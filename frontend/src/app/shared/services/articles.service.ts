import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {PopularArticlesType} from "../../../types/popular-articles.type";
import {ActiveParamsType} from "../../../types/active-params.type";
import {ArticleType} from "../../../types/article.type";

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) { }

  // запрос топ популярных статей
  getPopularArticles(): Observable<PopularArticlesType[]> {
    return this.http.get<PopularArticlesType[]>(environment.api + "articles/top");
  }

  // запрос всех статей + параметры
  getArticles(params: ActiveParamsType): Observable<{count: number, pages: number, items: PopularArticlesType[]}> {
    return this.http.get<{count: number, pages: number, items: PopularArticlesType[]}>(environment.api + "articles", {
      params: params
    });
  }

  // запрос связанных статей по URL
  getRelatedArticles(url: string): Observable<PopularArticlesType[]> {
    return this.http.get<PopularArticlesType[]>(environment.api + "articles/related/" + url);
  }

  // запрос конкретной статьи по URL
  getUrlArticle(url: string): Observable<ArticleType> {
    return this.http.get<ArticleType>(environment.api + "articles/" + url);
  }
}
