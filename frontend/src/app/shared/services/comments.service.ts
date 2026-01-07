import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {CommentsParamsType} from "../../../types/comments-params.type";
import {CommentsType} from "../../../types/comments.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {AddComment} from "../../../types/addComment";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) {
  }

  // Get comments(get) - получение всех комментариев и количества реакций (для всех пользователей)
  getComments(params: CommentsParamsType): Observable<{ allCount: number, comments: CommentsType[] }> {
    return this.http.get<{ allCount: number, comments: CommentsType[] }>(environment.api + "comments", {
      params: params
    });
  }

// Add comment(post) - добавить комментарий пользователя (текст + id_статьи) (только для авторизованных пользователей)
// http://localhost:3000/api/comments
  addComment(params: AddComment): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments', params);
  }

// Apply action(post) - поставить лайк\дизлайк\пожаловаться ("action": like,dislike,violate) по id_комментария  (только для авторизованных пользователей)
// http://localhost:3000/api/comments/695bf02c8d22ff336e024249/apply-action
  applyActionComment(idComment: string, action: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments/' + idComment + '/apply-action', {action});
  }

// Get Actions for comment(get) - получить один id_коммент c реакцией данного пользователя в комментариях (только для авторизованных пользователей)
// http://localhost:3000/api/comments/695bf02e8d22ff336e02424c/actions
  getActionsComments(idComment: string): Observable<{ comment: string, action: string }> {
    return this.http.get<{ comment: string, action: string }>(environment.api + 'comments/' + idComment + '/actions');
  }

// Get article comment actions for user(get) - получить список id_комментов c реакцией данного пользователя в комментариях (только для авторизованных пользователей)
// http://localhost:3000/api/comments/article-comment-actions?articleId=6932fd59b01b81d56f45e00b
  getArticleActionsComments(articleId: string): Observable<Array<{ comment: string, action: string }>> {
    return this.http.get<Array<{ comment: string, action: string }>>(
      environment.api + 'comments/article-comment-actions',
      {
        params: {articleId}
      }
    );
  }
}
