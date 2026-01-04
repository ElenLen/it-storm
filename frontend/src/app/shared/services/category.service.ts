import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CategoryType} from "../../../types/category.type";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) {
  }

  // для фильтра список категорий
  getCategories(): Observable<CategoryType[]> {
    return this.http.get<CategoryType[]>(environment.api + "categories");
  }
}
