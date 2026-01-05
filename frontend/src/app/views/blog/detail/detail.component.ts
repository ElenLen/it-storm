import { Component, OnInit } from '@angular/core';
import {PopularArticlesType} from "../../../../types/popular-articles.type";
import {ArticlesService} from "../../../shared/services/articles.service";
import {ActivatedRoute} from "@angular/router";
import {ArticleType} from "../../../../types/article.type";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {AuthService} from "../../../core/auth/auth.service";
import {takeUntil} from "rxjs";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  // для хранения услуг
  relatedArticles: PopularArticlesType[] = [];
  // конкретная статья
  urlArticle!: ArticleType;
  // для безопасной загрузки HTML
  sanitizedText!: SafeHtml;
  // проверяем залогинен или нет
  isLogged: boolean = false;

  constructor(private articlesService: ArticlesService,
              private activatedRoute: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private authService: AuthService,) {
    this.isLogged = this.authService.getIsLoggedId();
  }

  ngOnInit(): void {
  //   подписываемся на активейт парамс для взятия url
    this.activatedRoute.params.subscribe(params => {
      //   загружаем конкретную статью
      this.articlesService.getUrlArticle(params['url'])
        .subscribe((data: ArticleType) => {
          this.urlArticle = data;
          this.sanitizedText = this.sanitizeHtml(this.urlArticle.text);
        })

      //   загружаем связанные статьи
      this.articlesService.getRelatedArticles(params['url'])
        .subscribe((data: PopularArticlesType[]) => {
          this.relatedArticles = data;
        })
    })

    // Подписываемся на изменения статуса логина
    this.authService.isLogged$
      .subscribe((isLoggedIn: boolean) => {
        this.isLogged = isLoggedIn;
      });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
