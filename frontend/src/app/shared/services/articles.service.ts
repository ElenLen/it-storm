import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {PopularArticlesType} from "../../../types/popular-articles.type";

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) { }

  // адрес запроса услуг
  getPopularArticles(): Observable<PopularArticlesType[]> {
    return this.http.get<PopularArticlesType[]>(environment.api + "articles/top");
  }
}
