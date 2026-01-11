import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommentsType} from "../../../../types/comments.type";
import {CommentsService} from "../../services/comments.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {Router} from "@angular/router";

export const CommentAction = {
  LIKE: 'like' as const,
  DISLIKE: 'dislike' as const,
  VIOLATE: 'violate' as const
} as const;

// Тип для использования CommentAction
export type CommentActionType = typeof CommentAction[keyof typeof CommentAction];

@Component({
  selector: 'comment-card',
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss']
})

export class CommentCardComponent implements OnInit, OnChanges {

  @Input() comments: CommentsType; // Действие от родительского компонента
  @Output() commentUpdated = new EventEmitter<CommentsType>();
// Принимаем string для совместимости
  @Input() userAction: string | null = null;

  // Текущее действие пользователя (like/dislike/violate или null)
  currentUserAction: CommentActionType | null = null;
  // Флаг для блокировки повторных кликов
  isActionInProgress: boolean = false;
  // Проверка авторизации
  isLogged: boolean = false;
// Делаем константу доступной в шаблоне HTML
  readonly CommentAction = CommentAction;

  constructor(private commentsService: CommentsService,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
  ) {
    this.isLogged = this.authService.getIsLoggedId();
    this.comments = {
      id: '',
      text: '',
      date: '',
      likesCount: 0,
      dislikesCount: 0,
      user: {
        id: '',
        name: '',
      }
    }
  }

  ngOnInit(): void {
    // Устанавливаем действие из родительского компонента
    if (this.userAction !== undefined && this.userAction !== null) {
      this.currentUserAction = this.validateAction(this.userAction);
    }

    // Если действие не передано, загружаем самостоятельно
    if (this.isLogged && this.currentUserAction === null) {
      this.loadUserAction();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Если изменилось userAction от родителя, обновляем
    if (changes['userAction']) {
      const newValue = changes['userAction'].currentValue;
      this.currentUserAction = newValue ? this.validateAction(newValue) : null;
    }
  }

  // Загрузка действия пользователя для комментария
  private loadUserAction(): void {
    if (!this.comments?.id || !this.isLogged) return;

    this.commentsService.getActionsComments(this.comments.id)
      .subscribe({
        next: (response) => {
          // Преобразуем строку в наш тип
          this.currentUserAction = this.validateAction(response?.action);
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

  // Валидация действия
  private validateAction(action: string): CommentActionType | null {
    if (!action) return null;

    // Проверяем, является ли действие допустимым
    if (Object.values(CommentAction).includes(action as any)) {
      return action as CommentActionType;
    }
    return null;
  }

  // Обработка действий
  handleAction(action: CommentActionType): void {
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

  private handleSuccessAction(action: CommentActionType): void {
    if (action === CommentAction.LIKE || action === CommentAction.DISLIKE) {
      // Логика обновления счетчиков на основе нового состояния
      const oldAction = this.currentUserAction;
      let newAction: CommentActionType | null = action;

      // Если кликаем на уже активное действие - снимаем его
      if (oldAction === action) {
        newAction = null;
        this.adjustCounters(action, -1);
      } else {
        // Меняем действие
        newAction = action;

        // Убираем старое действие
        if (oldAction === CommentAction.LIKE || oldAction === CommentAction.DISLIKE) {
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
    } else if (action === CommentAction.VIOLATE) {
      this._snackBar.open('Жалоба отправлена', '', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  private adjustCounters(action: CommentActionType, delta: number): void {
    if (action === CommentAction.LIKE) {
      this.comments.likesCount = Math.max(0, this.comments.likesCount + delta);
    } else if (action === CommentAction.DISLIKE) {
      this.comments.dislikesCount = Math.max(0, this.comments.dislikesCount + delta);
    }
  }

  private handleErrorAction(action: CommentActionType, response: DefaultResponseType): void {
    if (action === CommentAction.VIOLATE && response.message?.includes('уже применено')) {
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

  private handleHttpError(action: CommentActionType, error: HttpErrorResponse): void {
    if (action === CommentAction.VIOLATE && error.status === 400) {
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

  isActionActive(action: CommentActionType): boolean {
    return this.currentUserAction === action;
  }

  // Вспомогательные методы для шаблона (опционально)
  isLikeActive(): boolean {
    return this.currentUserAction === CommentAction.LIKE;
  }

  isDislikeActive(): boolean {
    return this.currentUserAction === CommentAction.DISLIKE;
  }

  isViolateActive(): boolean {
    return this.currentUserAction === CommentAction.VIOLATE;
  }

}
