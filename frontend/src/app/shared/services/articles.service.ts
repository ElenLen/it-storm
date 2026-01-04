import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {PopularArticlesType} from "../../../types/popular-articles.type";
import {ActiveParamsType} from "../../../types/active-params.type";

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) { }

  // запрос топ популярных услуг
  getPopularArticles(): Observable<PopularArticlesType[]> {
    return this.http.get<PopularArticlesType[]>(environment.api + "articles/top");
  }

  // запрос всех услуг + параметры
  getArticles(params: ActiveParamsType): Observable<{count: number, pages: number, items: PopularArticlesType[]}> {
    return this.http.get<{count: number, pages: number, items: PopularArticlesType[]}>(environment.api + "articles", {
      params: params
    });
  }

}
