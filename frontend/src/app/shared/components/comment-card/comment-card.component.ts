import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommentsType} from "../../../../types/comments.type";
import {CommentsService} from "../../services/comments.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {Router} from "@angular/router";

@Component({
  selector: 'comment-card',
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss']
})
export class CommentCardComponent implements OnInit, OnChanges {

  @Input() comments!: CommentsType;
  @Input() userAction: string | null = null; // Действие от родительского компонента
  @Output() commentUpdated = new EventEmitter<CommentsType>();

  // Текущее действие пользователя (like/dislike/violate или null)
  currentUserAction: string | null = null;
  // Флаг для блокировки повторных кликов
  isActionInProgress: boolean = false;
  // Проверка авторизации
  isLogged: boolean = false;

  constructor(private commentsService: CommentsService,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
  ) {
    this.isLogged = this.authService.getIsLoggedId();
  }

  ngOnInit(): void {
    // Устанавливаем действие из родительского компонента
    if (this.userAction !== undefined) {
      this.currentUserAction = this.userAction;
    }

    // Если действие не передано, загружаем самостоятельно
    if (this.isLogged && this.currentUserAction === null) {
      this.loadUserAction();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Если изменилось userAction от родителя, обновляем
    if (changes['userAction']) {
      this.currentUserAction = changes['userAction'].currentValue;
    }
  }

  // Загрузка действия пользователя для комментария
  private loadUserAction(): void {
    if (!this.comments?.id || !this.isLogged) return;

    this.commentsService.getActionsComments(this.comments.id)
      .subscribe({
        next: (response) => {
          this.currentUserAction = response?.action || null;
        },
        error: (error) => {
          // 404 - это нормально, значит действия еще нет
          if (error.status !== 404) {
            console.error('Ошибка загрузки действия:', error);
          }
          this.currentUserAction = null;
        }
      });
  }

  // Обработка действий
  handleAction(action: 'like' | 'dislike' | 'violate'): void {
    if (!this.isLogged) {
      this.showAuthMessage();
      return;
    }

    if (this.isActionInProgress || !this.comments?.id) return;

    this.isActionInProgress = true;

    // Отправляем действие на сервер
    this.commentsService.applyActionComment(this.comments.id, action)
      .subscribe({
        next: (response: DefaultResponseType) => {
          if (!response.error) {
            this.handleSuccessAction(action);
          } else {
            this.handleErrorAction(action, response);
          }
          this.isActionInProgress = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleHttpError(action, error);
          this.isActionInProgress = false;
        }
      });
  }

  private handleSuccessAction(action: string): void {
    if (action === 'like' || action === 'dislike') {
      // Логика обновления счетчиков на основе нового состояния
      const oldAction = this.currentUserAction;
      let newAction: string | null = action;

      // Если кликаем на уже активное действие - снимаем его
      if (oldAction === action) {
        newAction = null;
        this.adjustCounters(action, -1);
      } else {
        // Меняем действие
        newAction = action;

        // Убираем старое действие
        if (oldAction === 'like' || oldAction === 'dislike') {
          this.adjustCounters(oldAction, -1);
        }

        // Добавляем новое действие
        this.adjustCounters(action, 1);
      }

      // Обновляем текущее действие
      this.currentUserAction = newAction;

      // Обновляем родительский компонент
      this.commentUpdated.emit(this.comments);

      this._snackBar.open('Ваш голос учтен', '', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } else if (action === 'violate') {
      this._snackBar.open('Жалоба отправлена', '', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  private adjustCounters(action: string, delta: number): void {
    if (action === 'like') {
      this.comments.likesCount = Math.max(0, this.comments.likesCount + delta);
    } else if (action === 'dislike') {
      this.comments.dislikesCount = Math.max(0, this.comments.dislikesCount + delta);
    }
  }

  private handleErrorAction(action: string, response: DefaultResponseType): void {
    if (action === 'violate' && response.message?.includes('уже применено')) {
      this._snackBar.open('Жалоба уже отправлена', '', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } else {
      this._snackBar.open(response.message || 'Ошибка', '', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private handleHttpError(action: string, error: HttpErrorResponse): void {
    if (action === 'violate' && error.status === 400) {
      this._snackBar.open('Жалоба уже отправлена', '', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } else {
      this._snackBar.open('Произошла ошибка', '', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Показать сообщение об авторизации
  private showAuthMessage(): void {
    this._snackBar.open('Для этого действия необходимо авторизоваться', 'Войти', {
      duration: 3000
    }).onAction().subscribe(() => {
      // Перенаправление на страницу логина
      this.router.navigate(['/login']);
    });
  }

  isActionActive(action: string): boolean {
    return this.currentUserAction === action;
  }

}
