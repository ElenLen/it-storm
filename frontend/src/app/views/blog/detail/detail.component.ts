import {Component, OnDestroy, OnInit} from '@angular/core';
import {PopularArticlesType} from "../../../../types/popular-articles.type";
import {ArticlesService} from "../../../shared/services/articles.service";
import {ActivatedRoute} from "@angular/router";
import {ArticleType} from "../../../../types/article.type";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {AuthService} from "../../../core/auth/auth.service";
import {CommentsType} from "../../../../types/comments.type";
import {CommentsService} from "../../../shared/services/comments.service";
import {CommentsParamsType} from "../../../../types/comments-params.type";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AddComment} from "../../../../types/addComment";
import {catchError, forkJoin, of, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {

  // для хранения услуг
  relatedArticles: PopularArticlesType[] = [];
  // конкретная статья
  urlArticle!: ArticleType;
  // для безопасной загрузки HTML
  sanitizedText!: SafeHtml;
  // проверяем залогинен или нет
  isLogged: boolean = false;
  // для комментариев
  comments: CommentsType[] = [];
  // комментарии у статьи
  activeParams: CommentsParamsType = {article: ''};
  // Флаг загрузки данных
  isLoading: boolean = true;
  // Флаги загрузки
  isCommentsLoaded: boolean = false;
  isActionsLoaded: boolean = false;

  //  для подгрузки комментариев
  showLoadMoreButton: boolean = false;
  currentOffset: number = 0;
  initialCommentsCount: number = 3; // показываем сначала 3
  totalComments: number = 0;

  // для отправки комментария
  commentForm: FormGroup;
  isSubmitting: boolean = false;
  submitError: string = '';

  // для хранения действий пользователя: commentId -> action
  userActionsMap = new Map<string, string>();

  // для обновления комментариев на стр при переходе на новую
  private destroy$ = new Subject<void>();

  constructor(private articlesService: ArticlesService,
              private activatedRoute: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private authService: AuthService,
              private commentsService: CommentsService,
              private fb: FormBuilder
  ) {
    this.isLogged = this.authService.getIsLoggedId();
    this.commentForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    //   подписываемся на активейт парамс для взятия url
    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        // Сбрасываем состояние при изменении статьи
        this.resetComponentState();
        //   загружаем конкретную статью
        this.loadArticle(params['url']);
        //   загружаем связанные статьи
        this.loadRelatedArticles(params['url']);
      })

    // Подписываемся на изменения статуса логина
    this.authService.isLogged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn: boolean) => {
        this.isLogged = isLoggedIn;
        if (isLoggedIn && this.activeParams.article) {
          // Загружаем действия пользователя при логине
          this.loadUserActionsForArticle();
        } else {
          this.userActionsMap.clear();
        }
      });
  }

  //   загружаем конкретную статью
  loadArticle(url: string): void {
    this.isLoading = true;

    this.articlesService.getUrlArticle(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ArticleType) => {
        this.urlArticle = data;
        this.sanitizedText = this.sanitizeHtml(this.urlArticle.text);
        // забираем id статьи
        this.activeParams.article = data.id;

        // Параллельно загружаем комментарии И действия пользователя
        this.loadCommentsAndActions();
      });
  }

  // Загрузка комментариев и действий пользователя параллельно
  private loadCommentsAndActions(): void {
    if (!this.activeParams.article) {
      this.isLoading = false;
      return;
    }

    const params: CommentsParamsType = {
      article: this.activeParams.article,
      offset: 0
    };

    // Если авторизован - загружаем оба запроса, иначе только комментарии
    if (this.isLogged) {
      forkJoin({
        comments: this.commentsService.getComments(params),
        actions: this.commentsService.getArticleActionsComments(this.activeParams.article)
          .pipe(
            catchError((error) => {
              // 404 - нормально, значит действий нет
              if (error.status !== 404) {
                console.error('Ошибка загрузки действий:', error);
              }
              return of([]);
            })
          )
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (results) => {
            // Обрабатываем комментарии
            this.totalComments = results.comments.allCount;
            this.comments = results.comments.comments.slice(0, this.initialCommentsCount);
            this.currentOffset = this.initialCommentsCount;
            this.updateLoadMoreButton();

            // Обрабатываем действия пользователя
            this.processUserActions(results.actions);

            this.isLoading = false;
            this.isCommentsLoaded = true;
            this.isActionsLoaded = true;
          },
          error: (error) => {
            console.error('Ошибка загрузки данных:', error);
            this.isLoading = false;
          }
        });
    } else {
      // Если не авторизован, загружаем только комментарии
      this.commentsService.getComments(params)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (commentsData) => {
            this.totalComments = commentsData.allCount;
            this.comments = commentsData.comments.slice(0, this.initialCommentsCount);
            this.currentOffset = this.initialCommentsCount;
            this.updateLoadMoreButton();

            this.userActionsMap.clear(); // Очищаем мапу действий

            this.isLoading = false;
            this.isCommentsLoaded = true;
            this.isActionsLoaded = true;
          },
          error: (error) => {
            console.error('Ошибка загрузки комментариев:', error);
            this.isLoading = false;
          }
        });
    }
  }

  // Метод для сброса состояния компонента
  private resetComponentState(): void {
    // Сбрасываем данные статьи
    this.urlArticle = null!;
    this.sanitizedText = null!;
    this.relatedArticles = [];

    // Сбрасываем комментарии
    this.comments = [];
    this.currentOffset = 0;
    this.totalComments = 0;
    this.showLoadMoreButton = false;

    // Сбрасываем форму комментария
    this.commentForm.reset();
    this.submitError = '';
    this.isSubmitting = false;

    // Сбрасываем активные параметры
    this.activeParams = {article: ''};
    this.userActionsMap.clear();
  }

  // Загрузка действий пользователя для всех комментариев статьи
  private loadUserActionsForArticle(): void {
    if (!this.activeParams.article || !this.isLogged) return;

    this.commentsService.getArticleActionsComments(this.activeParams.article)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (actions) => {
          this.processUserActions(actions);
        },
        error: (error) => {
          // 404 - это нормально, значит у пользователя нет действий
          if (error.status !== 404) {
            console.error('Ошибка загрузки действий пользователя:', error);
          }
        }
      });
  }

// Обработка полученных действий пользователя
  private processUserActions(actions: Array<{ comment: string, action: string }>): void {
    this.userActionsMap.clear();

    if (actions && Array.isArray(actions)) {
      actions.forEach(action => {
        if (action && action.comment && action.action) {
          this.userActionsMap.set(action.comment, action.action);
        }
      });
    }
  }

  // Метод для получения действия пользователя для комментария
  getUserActionForComment(commentId: string): string | null {
    return this.userActionsMap.get(commentId) || null;
  }

  // загрузка комментариев
  // loadComments(): void {
  //   if (!this.activeParams.article) return;
  //
  //   // Сначала загружаем первые 3 комментария
  //   const params: CommentsParamsType = {
  //     article: this.activeParams.article,
  //     offset: 0 // Всегда начинаем с 0 this.currentOffset
  //   };
  //
  //   this.commentsService.getComments(params)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe(dataComment => {
  //       this.totalComments = dataComment.allCount; // Общее количество комментариев
  //
  //       if (this.currentOffset === 0) {
  //         // берем первые 3 комментария (самые новые)
  //         this.comments = dataComment.comments.slice(0, this.initialCommentsCount);
  //         this.currentOffset = this.initialCommentsCount;
  //       }
  //
  //       // Определяем, нужно ли показывать кнопку "Загрузить еще"
  //       this.updateLoadMoreButton();
  //     });
  // }

  // дозагрузка комментариев
  loadMoreComments(): void {
    if (!this.activeParams.article) return;

    // увеличиваем offset на 10 для следующей загрузки
    const params: CommentsParamsType = {
      article: this.activeParams.article,
      offset: this.currentOffset
    };

    this.commentsService.getComments(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dataComment) => {
          // Берем следующие 10 комментариев
          this.comments = [...this.comments, ...dataComment.comments];
          this.currentOffset += dataComment.comments.length;

          // Проверяем, есть ли еще комментарии для загрузки
          this.updateLoadMoreButton();
        },
        error: (error) => {
          console.error('Ошибка загрузки комментариев:', error);
        }
      });
  }

  // кнопку "Загрузить еще"
  updateLoadMoreButton(): void {
    // Проверяем, что:
    // 1. Всего комментариев больше чем загружено
    // 2. И мы не находимся в процессе загрузки
    this.showLoadMoreButton = this.totalComments > this.comments.length;
  }

  // Метод для отправки комментария
  submitComment(): void {
    if (this.commentForm.invalid || !this.activeParams.article || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const commentData: AddComment = {
      text: this.commentForm.get('text')?.value.trim(),
      article: this.activeParams.article
    };

    this.commentsService.addComment(commentData)
      .subscribe({
        next: (response: DefaultResponseType) => {
          if (!response.error) {
            // Очищаем форму
            this.commentForm.reset();

            // Обновляем список комментариев
            this.refreshComments();

            // Увеличиваем счетчик комментариев у статьи
            this.urlArticle.commentsCount += 1;
            this.totalComments += 1;
          } else {
            this.submitError = response.message || 'Ошибка при отправке комментария';
          }
          this.isSubmitting = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Ошибка при отправке комментария:', error);
          this.submitError = 'Произошла ошибка при отправке комментария';
          this.isSubmitting = false;
        }
      });
  }

// Обновление комментариев после отправки
  private refreshComments(): void {
    if (!this.activeParams.article) return;

    const params: CommentsParamsType = {
      article: this.activeParams.article,
      offset: 0
    };

    this.commentsService.getComments(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(dataComment => {
        // Сбрасываем offset и показываем свежие комментарии
        this.comments = dataComment.comments.slice(0, this.initialCommentsCount);
        this.currentOffset = this.initialCommentsCount;
        this.totalComments = dataComment.allCount;
        this.updateLoadMoreButton();
      });
  }

// Метод для обработки обновления комментария
  onCommentUpdated(updatedComment: CommentsType): void {
    const index = this.comments.findIndex(c => c.id === updatedComment.id);
    if (index !== -1) {
      // Обновляем только счетчики
      this.comments[index].likesCount = updatedComment.likesCount;
      this.comments[index].dislikesCount = updatedComment.dislikesCount;
    }
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  //   загружаем связанные статьи
  loadRelatedArticles(url: string): void {
    this.articlesService.getRelatedArticles(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: PopularArticlesType[]) => {
        this.relatedArticles = data;
      });
  }

  // Геттер для удобства доступа к полю text
  get textField() {
    return this.commentForm.get('text');
  }

  ngOnDestroy(): void {
    // Отписываемся от всех подписок при уничтожении компонента
    this.destroy$.next();
    this.destroy$.complete();
  }

}
